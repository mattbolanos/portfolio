import type { GithubContributionDay } from "@/lib/api/github";
import type { HeatmapEntry } from "@/lib/heatmap";

export const toGithubHeatmapEntries = (
  contributionDays: GithubContributionDay[],
): HeatmapEntry[] =>
  contributionDays.map((contributionDay) => ({
    date: contributionDay.date,
    value: contributionDay.contributionCount,
  }));
