import type { HeatmapConfig } from "@/lib/heatmap";

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const HEATMAP_CONFIGS = {
  github: {
    colorVar: "--github",
    colorsByLevel: [
      "--empty",
      "--github-1",
      "--github-2",
      "--github-3",
      "--github-4",
    ],
    formatDayTitle: (cell) => {
      const formattedDate = DATE_FORMATTER.format(cell.date);

      if (cell.value === 0) {
        return `No contributions on ${formattedDate}`;
      }

      const contributionLabel =
        cell.value === 1 ? "contribution" : "contributions";

      return `${cell.value.toLocaleString("en-US")} ${contributionLabel} on ${formattedDate}`;
    },
    formatSummary: (total) =>
      `${Math.round(total).toLocaleString("en-US")} contributions in the last year`,
    range: [0, 40],
  },
  strava: {
    colorVar: "--strava",
    formatDayTitle: (cell) => {
      const formattedDate = DATE_FORMATTER.format(cell.date);

      if (cell.value === 0) {
        return `No miles run on ${formattedDate}`;
      }

      return `${cell.value.toFixed(2)} miles on ${formattedDate}`;
    },
    formatSummary: (total) => `${total.toFixed(1)} miles ran in the last year`,
    range: [0, 8],
  },
} satisfies Record<string, HeatmapConfig>;

export type HeatmapConfigId = keyof typeof HEATMAP_CONFIGS;

export const getHeatmapConfig = (id: HeatmapConfigId): HeatmapConfig =>
  HEATMAP_CONFIGS[id];
