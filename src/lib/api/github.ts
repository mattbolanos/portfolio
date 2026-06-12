import type { HeatmapEntry } from "@/lib/heatmap";
import {
  GithubContributionsQuerySchema,
  GithubRepoContributionsQuerySchema,
  GithubRepoSchema,
} from "./schemas/github";

const DEFAULT_RETRIES = 2;
const REQUEST_TIMEOUT_MS = 10_000;
const MAX_RETRY_DELAY_MS = 8_000;
const GITHUB_GRAPHQL_ENDPOINT = "https://api.github.com/graphql";
const GITHUB_REST_ENDPOINT = "https://api.github.com";
const GITHUB_CACHE_REVALIDATE_SECONDS = 24 * 60 * 60;
const GITHUB_LOOKBACK_DAYS = 366;
const GITHUB_LOGIN = "mattbolanos";

type JsonResponse = {
  payload: unknown | null;
  status: number;
};

type CacheEntry<T> = {
  expiresAt: number;
  inFlight: Promise<T | null> | null;
  value: T | null;
};

const githubCache = new Map<string, CacheEntry<unknown>>();

const CONTRIBUTIONS_QUERY = `
  query UserContributions($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          weeks {
            contributionDays {
              contributionCount
              date
            }
          }
        }
      }
    }
  }
`;

const REPO_CONTRIBUTIONS_QUERY = `
  query RepoContributions($from: DateTime!, $to: DateTime!) {
    viewer {
      contributionsCollection(from: $from, to: $to) {
        commitContributionsByRepository(maxRepositories: 100) {
          repository {
            nameWithOwner
          }
          contributions(first: 100) {
            nodes {
              commitCount
              occurredAt
            }
          }
        }
        issueContributionsByRepository(maxRepositories: 100) {
          repository {
            nameWithOwner
          }
          contributions(first: 100) {
            nodes {
              occurredAt
            }
          }
        }
        pullRequestContributionsByRepository(maxRepositories: 100) {
          repository {
            nameWithOwner
          }
          contributions(first: 100) {
            nodes {
              occurredAt
            }
          }
        }
        pullRequestReviewContributionsByRepository(maxRepositories: 100) {
          repository {
            nameWithOwner
          }
          contributions(first: 100) {
            nodes {
              occurredAt
            }
          }
        }
      }
    }
  }
`;

const sleep = async (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const withTimeout = async (
  input: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
};

const isRetriableStatus = (status: number): boolean =>
  status === 408 || status === 429 || (status >= 500 && status <= 599);

const parseRetryAfterMs = (retryAfterHeader: string | null): number | null => {
  if (!retryAfterHeader) {
    return null;
  }

  const asSeconds = Number(retryAfterHeader);

  if (Number.isFinite(asSeconds) && asSeconds >= 0) {
    return Math.min(asSeconds * 1_000, MAX_RETRY_DELAY_MS);
  }

  return null;
};

const getBackoffDelayMs = (attempt: number): number =>
  Math.min(250 * 2 ** attempt, MAX_RETRY_DELAY_MS);

const getCachedGithubValue = async <T>(
  key: string,
  load: () => Promise<T | null>,
): Promise<T | null> => {
  const cached = githubCache.get(key) as CacheEntry<T> | undefined;
  const now = Date.now();

  if (cached && cached.value !== null && cached.expiresAt > now) {
    return cached.value;
  }

  if (cached?.inFlight) {
    return cached.inFlight;
  }

  const inFlight = load()
    .then((value) => {
      if (value !== null) {
        githubCache.set(key, {
          expiresAt: Date.now() + GITHUB_CACHE_REVALIDATE_SECONDS * 1_000,
          inFlight: null,
          value,
        });
      } else if (!cached?.value) {
        githubCache.delete(key);
      }

      return value ?? cached?.value ?? null;
    })
    .catch(() => cached?.value ?? null)
    .finally(() => {
      const latest = githubCache.get(key);

      if (latest?.inFlight === inFlight) {
        latest.inFlight = null;
      }
    });

  githubCache.set(key, {
    expiresAt: cached?.expiresAt ?? 0,
    inFlight,
    value: cached?.value ?? null,
  });

  return inFlight;
};

const fetchJsonResponseWithRetry = async (
  url: string,
  init: RequestInit,
  retries = DEFAULT_RETRIES,
): Promise<JsonResponse | null> => {
  const attemptFetch = async (
    attempt: number,
  ): Promise<JsonResponse | null> => {
    try {
      const res = await withTimeout(url, init, REQUEST_TIMEOUT_MS);
      let payload: unknown | null = null;

      try {
        payload = await res.json();
      } catch {
        payload = null;
      }

      if (res.ok) {
        return {
          payload,
          status: res.status,
        };
      }

      if (!isRetriableStatus(res.status) || attempt >= retries) {
        return {
          payload,
          status: res.status,
        };
      }

      const retryAfterMs =
        parseRetryAfterMs(res.headers.get("retry-after")) ??
        getBackoffDelayMs(attempt);

      await sleep(retryAfterMs);
      return attemptFetch(attempt + 1);
    } catch {
      if (attempt >= retries) {
        return null;
      }

      await sleep(getBackoffDelayMs(attempt));
      return attemptFetch(attempt + 1);
    }
  };

  return attemptFetch(0);
};

const parseGithubRepo = (githubUrl: string): string | null => {
  try {
    const url = new URL(githubUrl);

    if (url.hostname !== "github.com" && url.hostname !== "www.github.com") {
      return null;
    }

    const [owner, repo] = url.pathname
      .split("/")
      .filter(Boolean)
      .map((pathPart) => pathPart.trim());

    if (!owner || !repo) {
      return null;
    }

    return `${owner}/${repo.replace(/\.git$/i, "")}`;
  } catch {
    return null;
  }
};

const getGithubHeaders = (requiresToken = true): HeadersInit | null => {
  const githubToken = process.env.GITHUB_TOKEN;

  if (requiresToken && !githubToken) {
    return null;
  }

  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
  };

  if (githubToken) {
    headers.Authorization = `Bearer ${githubToken}`;
  }

  return headers;
};

const getContributionWindow = (): { from: string; to: string } => {
  const to = new Date();
  to.setUTCHours(0, 0, 0, 0);

  const from = new Date(to);
  from.setUTCDate(to.getUTCDate() - GITHUB_LOOKBACK_DAYS);

  return { from: from.toISOString(), to: to.toISOString() };
};

const toContributionDate = (occurredAt: string): string =>
  occurredAt.slice(0, 10);

const incrementContributionCount = (
  totalsByDate: Map<string, number>,
  date: string,
  amount: number,
): void => {
  totalsByDate.set(date, (totalsByDate.get(date) ?? 0) + amount);
};

const getRepoPushedAt = async (githubUrl: string): Promise<string | null> => {
  const repo = parseGithubRepo(githubUrl);

  if (!repo) {
    return null;
  }

  return getCachedGithubValue(`repo-pushed-at:${repo.toLowerCase()}`, () =>
    fetchRepoPushedAt(repo),
  );
};

const fetchRepoPushedAt = async (repo: string): Promise<string | null> => {
  const headers = getGithubHeaders(false);
  const response = await fetchJsonResponseWithRetry(
    `${GITHUB_REST_ENDPOINT}/repos/${repo}`,
    {
      headers: headers ?? undefined,
      next: { revalidate: GITHUB_CACHE_REVALIDATE_SECONDS },
    },
    3,
  );

  if (!response || response.status < 200 || response.status >= 300) {
    return null;
  }

  const parsed = GithubRepoSchema.safeParse(response.payload);

  if (!parsed.success) {
    return null;
  }

  return parsed.data.pushed_at;
};

const fetchGithubContributions = async (): Promise<HeatmapEntry[] | null> => {
  const headers = getGithubHeaders();

  if (!headers) {
    return null;
  }

  const { from, to } = getContributionWindow();
  const response = await fetchJsonResponseWithRetry(
    GITHUB_GRAPHQL_ENDPOINT,
    {
      body: JSON.stringify({
        query: CONTRIBUTIONS_QUERY,
        variables: {
          from,
          login: GITHUB_LOGIN,
          to,
        },
      }),
      headers,
      method: "POST",
      next: { revalidate: GITHUB_CACHE_REVALIDATE_SECONDS },
    },
    3,
  );

  if (!response || response.status < 200 || response.status >= 300) {
    return null;
  }

  const parsed = GithubContributionsQuerySchema.safeParse(response.payload);

  if (!parsed.success || parsed.data.errors?.length) {
    return null;
  }

  const contributionDays =
    parsed.data.data.user?.contributionsCollection.contributionCalendar.weeks
      .flatMap((week) => week.contributionDays)
      .toSorted((dayA, dayB) => dayA.date.localeCompare(dayB.date));

  if (!contributionDays?.length) {
    return null;
  }

  return contributionDays.map((contributionDay) => ({
    date: contributionDay.date,
    value: contributionDay.contributionCount,
  }));
};

const fetchGithubRepoContributions = async (
  githubUrl: string,
): Promise<HeatmapEntry[] | null> => {
  const repoNameWithOwner = parseGithubRepo(githubUrl)?.toLowerCase();

  if (!repoNameWithOwner) {
    return null;
  }

  const headers = getGithubHeaders();

  if (!headers) {
    return null;
  }

  const { from, to } = getContributionWindow();
  const response = await fetchJsonResponseWithRetry(
    GITHUB_GRAPHQL_ENDPOINT,
    {
      body: JSON.stringify({
        query: REPO_CONTRIBUTIONS_QUERY,
        variables: {
          from,
          to,
        },
      }),
      headers,
      method: "POST",
      next: { revalidate: GITHUB_CACHE_REVALIDATE_SECONDS },
    },
    3,
  );

  if (!response || response.status < 200 || response.status >= 300) {
    return null;
  }

  const parsed = GithubRepoContributionsQuerySchema.safeParse(response.payload);

  if (!parsed.success || parsed.data.errors?.length) {
    return null;
  }

  const collection = parsed.data.data.viewer.contributionsCollection;
  const totalsByDate = new Map<string, number>();

  for (const repoContributions of collection.commitContributionsByRepository) {
    if (
      repoContributions.repository.nameWithOwner.toLowerCase() !==
      repoNameWithOwner
    ) {
      continue;
    }

    for (const contribution of repoContributions.contributions.nodes) {
      incrementContributionCount(
        totalsByDate,
        toContributionDate(contribution.occurredAt),
        contribution.commitCount,
      );
    }
  }

  const timedContributionGroups = [
    collection.issueContributionsByRepository,
    collection.pullRequestContributionsByRepository,
    collection.pullRequestReviewContributionsByRepository,
  ];

  for (const contributionGroup of timedContributionGroups) {
    for (const repoContributions of contributionGroup) {
      if (
        repoContributions.repository.nameWithOwner.toLowerCase() !==
        repoNameWithOwner
      ) {
        continue;
      }

      for (const contribution of repoContributions.contributions.nodes) {
        incrementContributionCount(
          totalsByDate,
          toContributionDate(contribution.occurredAt),
          1,
        );
      }
    }
  }

  return Array.from(totalsByDate.entries())
    .map(([date, value]) => ({
      date,
      value,
    }))
    .toSorted((dayA, dayB) => dayA.date.localeCompare(dayB.date));
};

const getGithubContributions = async (): Promise<HeatmapEntry[]> =>
  (await getCachedGithubValue("contributions", fetchGithubContributions)) ?? [];

const getGithubRepoContributions = async (
  githubUrl: string,
): Promise<HeatmapEntry[]> => {
  const repoNameWithOwner = parseGithubRepo(githubUrl)?.toLowerCase();

  if (!repoNameWithOwner) {
    return [];
  }

  return (
    (await getCachedGithubValue(`repo-contributions:${repoNameWithOwner}`, () =>
      fetchGithubRepoContributions(githubUrl),
    )) ?? []
  );
};

export { getGithubContributions, getGithubRepoContributions, getRepoPushedAt };
