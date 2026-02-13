import {
  StravaActivitiesSchema,
  type StravaActivity,
  StravaActivitySchema,
} from "./schemas/strava";

const METERS_PER_MILE = 1609.344;
const DEFAULT_RETRIES = 2;
const REQUEST_TIMEOUT_MS = 10_000;
const MAX_RETRY_DELAY_MS = 8_000;

type GetActivitiesOptions = {
  maxPages?: number;
  perPage?: number;
};

type HeatmapDay = {
  activityCount: number;
  date: string;
  distanceMeters: number;
  miles: number;
  runCount: number;
};

export type GetActivitiesResult = {
  heatmap: HeatmapDay[];
  runActivities: StravaActivity[];
  totals: {
    activityCount: number;
    runCount: number;
    runDistanceMeters: number;
    runMiles: number;
  };
};

const EMPTY_ACTIVITIES_RESULT: GetActivitiesResult = {
  heatmap: [],
  runActivities: [],
  totals: {
    activityCount: 0,
    runCount: 0,
    runDistanceMeters: 0,
    runMiles: 0,
  },
};

const roundTo = (value: number, digits: number): number => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

const toEpochSeconds = (date: Date): string =>
  Math.floor(date.getTime() / 1000).toString();

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

  const asDate = Date.parse(retryAfterHeader);

  if (Number.isNaN(asDate)) {
    return null;
  }

  return Math.min(Math.max(0, asDate - Date.now()), MAX_RETRY_DELAY_MS);
};

const getBackoffDelayMs = (attempt: number): number =>
  Math.min(250 * 2 ** attempt, MAX_RETRY_DELAY_MS);

const fetchJsonWithRetry = async (
  url: string,
  init: RequestInit,
  retries = DEFAULT_RETRIES,
): Promise<unknown | null> => {
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const res = await withTimeout(url, init, REQUEST_TIMEOUT_MS);

      if (res.ok) {
        return await res.json();
      }

      if (!isRetriableStatus(res.status) || attempt >= retries) {
        return null;
      }

      const retryAfterMs =
        parseRetryAfterMs(res.headers.get("retry-after")) ??
        getBackoffDelayMs(attempt);

      await sleep(retryAfterMs);
    } catch {
      if (attempt >= retries) {
        return null;
      }

      await sleep(getBackoffDelayMs(attempt));
    }
  }

  return null;
};

const parseActivitiesPage = (payload: unknown): StravaActivity[] => {
  const parsed = StravaActivitiesSchema.safeParse(payload);

  if (parsed.success) {
    return parsed.data;
  }

  if (!Array.isArray(payload)) {
    return [];
  }

  const activities: StravaActivity[] = [];

  for (const activity of payload) {
    const item = StravaActivitySchema.safeParse(activity);

    if (item.success) {
      activities.push(item.data);
    }
  }

  return activities;
};

const getAccessToken = async (): Promise<string | null> => {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  const refreshToken = process.env.STRAVA_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    return null;
  }

  const payload = await fetchJsonWithRetry(
    "https://www.strava.com/oauth/token",
    {
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
      next: { revalidate: 300 },
    },
    3,
  );

  if (!payload || typeof payload !== "object") {
    return null;
  }

  return "access_token" in payload && typeof payload.access_token === "string"
    ? payload.access_token
    : null;
};

export const getActivities = async ({
  maxPages = 8,
  perPage = 100,
}: GetActivitiesOptions = {}): Promise<GetActivitiesResult | null> => {
  "use cache";
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return EMPTY_ACTIVITIES_RESULT;
  }

  const oneYearAgo = new Date();
  oneYearAgo.setDate(oneYearAgo.getDate() - 366);

  const runActivities: StravaActivity[] = [];
  const seenActivityIds = new Set<number>();

  for (let page = 1; page <= maxPages; page += 1) {
    const searchParams = new URLSearchParams({
      after: toEpochSeconds(oneYearAgo),
      page: page.toString(),
      per_page: perPage.toString(),
    });

    const payload = await fetchJsonWithRetry(
      `https://www.strava.com/api/v3/athlete/activities?${searchParams.toString()}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        next: { revalidate: 300 },
      },
      3,
    );

    if (!Array.isArray(payload)) {
      if (page === 1 && runActivities.length === 0) {
        return EMPTY_ACTIVITIES_RESULT;
      }

      break;
    }

    const activities = parseActivitiesPage(payload);
    const runs = activities.filter((activity) => activity.type === "Run");

    for (const run of runs) {
      if (seenActivityIds.has(run.id)) {
        continue;
      }

      seenActivityIds.add(run.id);
      runActivities.push(run);
    }

    if (payload.length < perPage) {
      break;
    }
  }

  const byDay = new Map<
    string,
    {
      activityCount: number;
      distanceMeters: number;
      runCount: number;
    }
  >();

  for (const activity of runActivities) {
    const date = activity.start_date_local.slice(0, 10);
    const day = byDay.get(date) ?? {
      activityCount: 0,
      distanceMeters: 0,
      runCount: 0,
    };

    day.activityCount += 1;
    day.distanceMeters += activity.distance;
    day.runCount += 1;
    byDay.set(date, day);
  }

  const heatmap = [...byDay.entries()]
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .map(([date, day]) => ({
      ...day,
      date,
      miles: roundTo(day.distanceMeters / METERS_PER_MILE, 2),
    }));

  const runDistanceMeters = runActivities.reduce(
    (sum, activity) => sum + activity.distance,
    0,
  );

  return {
    heatmap,
    runActivities,
    totals: {
      activityCount: runActivities.length,
      runCount: runActivities.length,
      runDistanceMeters,
      runMiles: roundTo(runDistanceMeters / METERS_PER_MILE, 2),
    },
  };
};
