import { cacheLife } from "next/cache";
import {
  GithubContributionsQuerySchema,
  GithubRepoContributionsQuerySchema,
  GithubRepoSchema,
} from "./schemas/github";

export type GithubContributionDay = {
  contributionCount: number;
  date: string;
};

const GITHUB_GRAPHQL_ENDPOINT = "https://api.github.com/graphql";
const GITHUB_CACHE_REVALIDATE_SECONDS = 4 * 60 * 60;
const GITHUB_CACHE_EXPIRE_SECONDS = 8 * 60 * 60;

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

function parseGithubRepo(url: string): string | null {
  const match = url.match(/github\.com\/([^/?#]+\/[^/?#]+)/);
  return match?.[1]?.replace(/\.git$/i, "") ?? null;
}

const getGithubHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
  };
  const githubToken = process.env.GITHUB_TOKEN;

  if (githubToken) {
    headers.Authorization = `Bearer ${githubToken}`;
  }

  return headers;
};

const getContributionWindow = (): { from: string; to: string } => {
  const to = new Date();
  const from = new Date(to);
  from.setDate(to.getDate() - 366);

  return { from: from.toISOString(), to: to.toISOString() };
};

const toContributionDate = (occurredAt: string): string =>
  occurredAt.slice(0, 10);

const incrementContributionCount = (
  totalsByDate: Map<string, number>,
  date: string,
  amount: number,
) => {
  const previousTotal = totalsByDate.get(date) ?? 0;
  totalsByDate.set(date, previousTotal + amount);
};

export async function getRepoPushedAt(
  githubUrl: string,
): Promise<string | null> {
  "use cache";

  cacheLife({
    expire: GITHUB_CACHE_EXPIRE_SECONDS,
    revalidate: GITHUB_CACHE_REVALIDATE_SECONDS,
  });

  const repo = parseGithubRepo(githubUrl);
  if (!repo) return null;

  const res = await fetch(`https://api.github.com/repos/${repo}`, {
    headers: getGithubHeaders(),
  });

  if (!res.ok) return null;

  const parsed = GithubRepoSchema.safeParse(await res.json());
  if (!parsed.success) return null;

  return parsed.data.pushed_at;
}

export async function getGithubContributions(): Promise<
  GithubContributionDay[] | null
> {
  "use cache";

  cacheLife({
    expire: GITHUB_CACHE_EXPIRE_SECONDS,
    revalidate: GITHUB_CACHE_REVALIDATE_SECONDS,
  });

  const { from, to } = getContributionWindow();

  const res = await fetch(GITHUB_GRAPHQL_ENDPOINT, {
    body: JSON.stringify({
      query: CONTRIBUTIONS_QUERY,
      variables: {
        from,
        login: "mattbolanos",
        to,
      },
    }),
    headers: getGithubHeaders(),
    method: "POST",
  });

  if (!res.ok) {
    return null;
  }

  const parsed = GithubContributionsQuerySchema.safeParse(await res.json());

  if (!parsed.success || parsed.data.errors?.length) {
    return null;
  }

  const contributionDays =
    parsed.data.data.user?.contributionsCollection.contributionCalendar.weeks
      .flatMap((week) => week.contributionDays)
      .map((contributionDay) => ({
        contributionCount: contributionDay.contributionCount,
        date: contributionDay.date,
      }));

  if (!contributionDays?.length) {
    return null;
  }

  return contributionDays.sort((dayA, dayB) =>
    dayA.date.localeCompare(dayB.date),
  );
}

export async function getGithubRepoContributions(
  githubUrl: string,
): Promise<GithubContributionDay[] | null> {
  "use cache";

  cacheLife({
    expire: GITHUB_CACHE_EXPIRE_SECONDS,
    revalidate: GITHUB_CACHE_REVALIDATE_SECONDS,
  });

  const repoNameWithOwner = parseGithubRepo(githubUrl)?.toLowerCase();

  if (!repoNameWithOwner) {
    return null;
  }

  const { from, to } = getContributionWindow();

  const res = await fetch(GITHUB_GRAPHQL_ENDPOINT, {
    body: JSON.stringify({
      query: REPO_CONTRIBUTIONS_QUERY,
      variables: {
        from,
        to,
      },
    }),
    headers: getGithubHeaders(),
    method: "POST",
  });

  if (!res.ok) {
    return null;
  }

  const parsed = GithubRepoContributionsQuerySchema.safeParse(await res.json());

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

  return [...totalsByDate.entries()]
    .map(([date, contributionCount]) => ({
      contributionCount,
      date,
    }))
    .sort((dayA, dayB) => dayA.date.localeCompare(dayB.date));
}
