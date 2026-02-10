import { StravaActivitiesSchema, type StravaActivity } from "./schemas/strava";

const METERS_PER_MILE = 1609.344;
const RUN_SPORT_TYPES = new Set(["Run", "TrailRun", "VirtualRun"]);

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
  activities: StravaActivity[];
  heatmap: HeatmapDay[];
  runActivities: StravaActivity[];
  totals: {
    activityCount: number;
    runCount: number;
    runDistanceMeters: number;
    runMiles: number;
  };
};

const roundTo = (value: number, digits: number): number => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

const toEpochSeconds = (date: Date): string =>
  Math.floor(date.getTime() / 1000).toString();

const getAccessToken = async (): Promise<string | null> => {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  const refreshToken = process.env.STRAVA_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    return null;
  }

  const res = await fetch("https://www.strava.com/oauth/token", {
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    throw new Error(`Failed to refresh Strava token (${res.status})`);
  }

  const payload = await res.json();
  return typeof payload.access_token === "string" ? payload.access_token : null;
};

export const getActivities = async ({
  maxPages = 8,
  perPage = 100,
}: GetActivitiesOptions = {}): Promise<GetActivitiesResult | null> => {
  "use cache";
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return {
      activities: [],
      heatmap: [],
      runActivities: [],
      totals: {
        activityCount: 0,
        runCount: 0,
        runDistanceMeters: 0,
        runMiles: 0,
      },
    };
  }

  const oneYearAgo = new Date();
  oneYearAgo.setDate(oneYearAgo.getDate() - 366);

  const activities: StravaActivity[] = [];

  for (let page = 1; page <= maxPages; page += 1) {
    const searchParams = new URLSearchParams({
      after: toEpochSeconds(oneYearAgo),
      page: page.toString(),
      per_page: perPage.toString(),
    });

    const res = await fetch(
      `https://www.strava.com/api/v3/athlete/activities?${searchParams.toString()}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        next: { revalidate: 300 },
      },
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch Strava activities (${res.status})`);
    }

    const payload = await res.json();
    const parsed = StravaActivitiesSchema.safeParse(payload);

    if (!parsed.success) {
      return null;
    }

    activities.push(...parsed.data);

    if (parsed.data.length < perPage) {
      break;
    }
  }

  const runActivities = activities.filter((activity) =>
    RUN_SPORT_TYPES.has(activity.sport_type),
  );

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
    activities,
    heatmap,
    runActivities,
    totals: {
      activityCount: activities.length,
      runCount: runActivities.length,
      runDistanceMeters,
      runMiles: roundTo(runDistanceMeters / METERS_PER_MILE, 2),
    },
  };
};
