import type { HeatmapConfig } from "@/lib/heatmap";

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const HEATMAP_CONFIGS = {
  strava: {
    colorVar: "--strava",
    formatDayTitle: (cell) => {
      const formattedDate = DATE_FORMATTER.format(cell.date);

      if (cell.count === 0) {
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
