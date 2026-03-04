import type { GetActivitiesResult } from "@/lib/api/strava";
import type { HeatmapEntry } from "@/lib/heatmap";

type HeatmapDay = GetActivitiesResult["heatmap"][number];

export const toStravaHeatmapEntries = (days: HeatmapDay[]): HeatmapEntry[] =>
  days.map((day) => ({
    count: day.runCount,
    date: day.date,
    value: day.miles,
  }));
