import {
  StravaActivitiesSchema,
  type StravaActivity,
  StravaActivitySchema,
} from "./schemas/strava";

const METERS_PER_MILE = 1609.344;
const DEFAULT_RETRIES = 2;
const REQUEST_TIMEOUT_MS = 10_000;
const MAX_RETRY_DELAY_MS = 8_000;
const STRAVA_LOOKBACK_DAYS = 366;
const STRAVA_MAX_PER_PAGE = 200;
const DEFAULT_ACTIVITIES_PER_PAGE = STRAVA_MAX_PER_PAGE;
const INITIAL_PARALLEL_ACTIVITY_PAGES = 2;
const ACTIVITIES_CACHE_TTL_MS = 24 * 60 * 60 * 1_000;
const STRAVA_CACHE_REVALIDATE_SECONDS = 24 * 60 * 60;

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

type JsonResponse = {
  payload: unknown | null;
  status: number;
};

type AccessTokenOptions = {
  forceRefresh?: boolean;
};

type RefreshedTokenPayload = {
  accessToken: string;
  expiresAt: number;
  refreshToken: string;
};

type StravaTokenState = {
  accessToken: string | null;
  expiresAt: number | null;
  refreshToken: string | null;
};

type ActivitiesCacheEntry = {
  expiresAt: number;
  value: GetActivitiesResult;
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

const tokenState: StravaTokenState = {
  accessToken: null,
  expiresAt: null,
  refreshToken: process.env.STRAVA_REFRESH_TOKEN ?? null,
};

let tokenRefreshInFlight: Promise<string | null> | null = null;
const activitiesCache = new Map<string, ActivitiesCacheEntry>();
const activitiesInFlight = new Map<
  string,
  Promise<GetActivitiesResult | null>
>();

const roundTo = (value: number, digits: number): number => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

const cloneActivitiesResult = (
  result: GetActivitiesResult,
): GetActivitiesResult => ({
  heatmap: result.heatmap.map((day) => ({ ...day })),
  runActivities: result.runActivities.map((activity) => ({ ...activity })),
  totals: { ...result.totals },
});

const normalizeMaxPages = (maxPages?: number): number | null => {
  if (typeof maxPages !== "number") {
    return null;
  }

  const normalized = Math.floor(maxPages);
  return normalized > 0 ? normalized : null;
};

const normalizePerPage = (perPage?: number): number => {
  if (typeof perPage !== "number") {
    return DEFAULT_ACTIVITIES_PER_PAGE;
  }

  const normalized = Math.floor(perPage);

  if (normalized <= 0) {
    return DEFAULT_ACTIVITIES_PER_PAGE;
  }

  return Math.min(normalized, STRAVA_MAX_PER_PAGE);
};

const toEpochSeconds = (date: Date): string =>
  Math.floor(date.getTime() / 1000).toString();

const getLookbackStart = (): Date => {
  const lookbackStart = new Date();
  lookbackStart.setUTCHours(0, 0, 0, 0);
  lookbackStart.setUTCDate(lookbackStart.getUTCDate() - STRAVA_LOOKBACK_DAYS);
  return lookbackStart;
};

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

const fetchJsonResponseWithRetry = async (
  url: string,
  init: RequestInit,
  retries = DEFAULT_RETRIES,
): Promise<JsonResponse | null> => {
  for (let attempt = 0; attempt <= retries; attempt += 1) {
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
    } catch {
      if (attempt >= retries) {
        return null;
      }

      await sleep(getBackoffDelayMs(attempt));
    }
  }

  return null;
};

const fetchJsonWithRetry = async (
  url: string,
  init: RequestInit,
  retries = DEFAULT_RETRIES,
): Promise<unknown | null> => {
  const response = await fetchJsonResponseWithRetry(url, init, retries);

  if (!response || response.status < 200 || response.status >= 300) {
    return null;
  }

  return response.payload;
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

const parseRefreshedTokenPayload = (
  payload: unknown,
  fallbackRefreshToken: string,
): RefreshedTokenPayload | null => {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const data = payload as Record<string, unknown>;
  const accessToken = data.access_token;
  const refreshToken = data.refresh_token;
  const expiresAtRaw = data.expires_at;
  const expiresAt =
    typeof expiresAtRaw === "number" ? expiresAtRaw : Number(expiresAtRaw);

  if (
    typeof accessToken !== "string" ||
    !Number.isFinite(expiresAt) ||
    expiresAt <= 0
  ) {
    return null;
  }

  return {
    accessToken,
    expiresAt,
    refreshToken:
      typeof refreshToken === "string" ? refreshToken : fallbackRefreshToken,
  };
};

const requestRefreshedToken = async (
  clientId: string,
  clientSecret: string,
  refreshToken: string,
): Promise<RefreshedTokenPayload | null> => {
  const payload = await fetchJsonWithRetry(
    "https://www.strava.com/oauth/token",
    {
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      method: "POST",
    },
    3,
  );

  return parseRefreshedTokenPayload(payload, refreshToken);
};

const refreshAccessToken = async (
  clientId: string,
  clientSecret: string,
  envRefreshToken: string,
): Promise<string | null> => {
  const candidateRefreshTokens = [tokenState.refreshToken, envRefreshToken]
    .filter((token, index, all) => token && all.indexOf(token) === index)
    .map((token) => token as string);

  for (const refreshToken of candidateRefreshTokens) {
    const refreshed = await requestRefreshedToken(
      clientId,
      clientSecret,
      refreshToken,
    );

    if (!refreshed) {
      continue;
    }

    tokenState.accessToken = refreshed.accessToken;
    tokenState.expiresAt = refreshed.expiresAt;
    tokenState.refreshToken = refreshed.refreshToken;
    process.env.STRAVA_REFRESH_TOKEN = refreshed.refreshToken;

    return refreshed.accessToken;
  }

  tokenState.accessToken = null;
  tokenState.expiresAt = null;
  return null;
};

const getAccessToken = async ({
  forceRefresh = false,
}: AccessTokenOptions = {}): Promise<string | null> => {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  const envRefreshToken = process.env.STRAVA_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !envRefreshToken) {
    return null;
  }

  if (!tokenState.refreshToken) {
    tokenState.refreshToken = envRefreshToken;
  }

  if (!forceRefresh && tokenState.accessToken) {
    return tokenState.accessToken;
  }

  if (tokenRefreshInFlight) {
    return tokenRefreshInFlight;
  }

  tokenRefreshInFlight = refreshAccessToken(
    clientId,
    clientSecret,
    envRefreshToken,
  ).finally(() => {
    tokenRefreshInFlight = null;
  });

  return tokenRefreshInFlight;
};

type FetchActivitiesOptions = {
  afterEpochSeconds: string;
  maxPages: number | null;
  perPage: number;
};

type ActivitiesPageResponse = {
  payload: unknown | null;
};

const getActivitiesCacheKey = ({
  afterEpochSeconds,
  maxPages,
  perPage,
}: FetchActivitiesOptions): string =>
  [afterEpochSeconds, maxPages ?? "all", perPage].join(":");

const getCachedActivities = (cacheKey: string): GetActivitiesResult | null => {
  const cached = activitiesCache.get(cacheKey);

  if (!cached) {
    return null;
  }

  if (cached.expiresAt <= Date.now()) {
    activitiesCache.delete(cacheKey);
    return null;
  }

  return cached.value;
};

const setCachedActivities = (
  cacheKey: string,
  activities: GetActivitiesResult,
): void => {
  activitiesCache.set(cacheKey, {
    expiresAt: Date.now() + ACTIVITIES_CACHE_TTL_MS,
    value: cloneActivitiesResult(activities),
  });
};

const getActivitiesUrl = ({
  afterEpochSeconds,
  page,
  perPage,
}: {
  afterEpochSeconds: string;
  page: number;
  perPage: number;
}): string => {
  const searchParams = new URLSearchParams({
    after: afterEpochSeconds,
    page: page.toString(),
    per_page: perPage.toString(),
  });

  return `https://www.strava.com/api/v3/athlete/activities?${searchParams.toString()}`;
};

const fetchActivitiesPageResponse = async ({
  accessToken,
  afterEpochSeconds,
  page,
  perPage,
}: {
  accessToken: string;
  afterEpochSeconds: string;
  page: number;
  perPage: number;
}): Promise<ActivitiesPageResponse> => {
  const activitiesUrl = getActivitiesUrl({
    afterEpochSeconds,
    page,
    perPage,
  });

  let response = await fetchJsonResponseWithRetry(
    activitiesUrl,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      next: { revalidate: STRAVA_CACHE_REVALIDATE_SECONDS },
    },
    3,
  );

  if (response?.status === 401) {
    const refreshedAccessToken = await getAccessToken({ forceRefresh: true });

    if (refreshedAccessToken) {
      response = await fetchJsonResponseWithRetry(
        activitiesUrl,
        {
          headers: { Authorization: `Bearer ${refreshedAccessToken}` },
          next: { revalidate: STRAVA_CACHE_REVALIDATE_SECONDS },
        },
        3,
      );
    }
  }

  return {
    payload:
      response && response.status >= 200 && response.status < 300
        ? response.payload
        : null,
  };
};

const fetchActivities = async ({
  afterEpochSeconds,
  maxPages,
  perPage,
}: FetchActivitiesOptions): Promise<GetActivitiesResult | null> => {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return null;
  }

  const runActivities: StravaActivity[] = [];
  const seenActivityIds = new Set<number>();
  const initialPageCount =
    maxPages === null
      ? INITIAL_PARALLEL_ACTIVITY_PAGES
      : Math.min(maxPages, INITIAL_PARALLEL_ACTIVITY_PAGES);

  const appendPage = (
    page: number,
    response: ActivitiesPageResponse,
  ): "continue" | "stop" | "abort" => {
    if (!Array.isArray(response.payload)) {
      if (page === 1 && runActivities.length === 0) {
        return "abort";
      }

      return "stop";
    }

    const activities = parseActivitiesPage(response.payload);
    const runs = activities.filter((activity) => activity.type === "Run");

    for (const run of runs) {
      if (seenActivityIds.has(run.id)) {
        continue;
      }

      seenActivityIds.add(run.id);
      runActivities.push(run);
    }

    return response.payload.length < perPage ? "stop" : "continue";
  };

  const initialResponses = await Promise.all(
    Array.from({ length: initialPageCount }, (_, index) =>
      fetchActivitiesPageResponse({
        accessToken,
        afterEpochSeconds,
        page: index + 1,
        perPage,
      }),
    ),
  );

  let shouldContinueSequentially = true;

  for (let page = 1; page <= initialResponses.length; page += 1) {
    const outcome = appendPage(page, initialResponses[page - 1]);

    if (outcome === "abort") {
      return null;
    }

    if (outcome === "stop") {
      shouldContinueSequentially = false;
      break;
    }
  }

  if (shouldContinueSequentially) {
    for (
      let page = initialPageCount + 1;
      maxPages === null || page <= maxPages;
      page += 1
    ) {
      const response = await fetchActivitiesPageResponse({
        accessToken,
        afterEpochSeconds,
        page,
        perPage,
      });
      const outcome = appendPage(page, response);

      if (outcome === "abort") {
        return null;
      }

      if (outcome === "stop") {
        break;
      }
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

export const getActivities = async ({
  maxPages,
  perPage = DEFAULT_ACTIVITIES_PER_PAGE,
}: GetActivitiesOptions = {}): Promise<GetActivitiesResult> => {
  const normalizedMaxPages = normalizeMaxPages(maxPages);
  const normalizedPerPage = normalizePerPage(perPage);
  const lookbackStart = getLookbackStart();
  const afterEpochSeconds = toEpochSeconds(lookbackStart);
  const options = {
    afterEpochSeconds,
    maxPages: normalizedMaxPages,
    perPage: normalizedPerPage,
  };
  const cacheKey = getActivitiesCacheKey(options);
  const cachedActivities = getCachedActivities(cacheKey);

  if (cachedActivities) {
    return cloneActivitiesResult(cachedActivities);
  }

  const inFlight =
    activitiesInFlight.get(cacheKey) ??
    fetchActivities(options).finally(() => {
      activitiesInFlight.delete(cacheKey);
    });

  activitiesInFlight.set(cacheKey, inFlight);

  const activities = await inFlight;

  if (activities) {
    setCachedActivities(cacheKey, activities);
  }

  return cloneActivitiesResult(activities ?? EMPTY_ACTIVITIES_RESULT);
};
