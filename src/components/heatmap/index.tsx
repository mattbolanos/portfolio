import { cacheLife } from "next/cache";
import {
  buildHeatmapView,
  buildMonthLabels,
  COLOR_MIX_BY_LEVEL,
  DAY_LABELS,
  getLevel,
  type HeatmapConfig,
  type HeatmapEntry,
  toDateKey,
} from "@/lib/heatmap";
import { getHeatmapConfig, type HeatmapConfigId } from "@/lib/heatmap/configs";
import { cn } from "@/lib/utils";

interface HeatmapProps {
  configId: HeatmapConfigId;
  data: HeatmapEntry[];
  summaryRangeLabel?: string;
  weeksToShow?: number;
}

const tileColor = (config: HeatmapConfig, level: number): string =>
  config.colorsByLevel
    ? `var(${config.colorsByLevel[level]})`
    : `color-mix(in oklch, var(${config.colorVar}) ${COLOR_MIX_BY_LEVEL[level]}%, var(--empty))`;

export const Heatmap = async ({
  configId,
  data,
  summaryRangeLabel,
  weeksToShow,
}: HeatmapProps) => {
  "use cache";
  cacheLife("days");

  const config = getHeatmapConfig(configId);
  const view = buildHeatmapView(data, weeksToShow);
  const monthLabels = buildMonthLabels(view.weeks);
  const labels = new Map(
    monthLabels.map((monthLabel) => [monthLabel.weekIndex, monthLabel.label]),
  );
  const monthLabelsByWeek = view.weeks.map((week, weekIndex) => ({
    label: labels.get(weekIndex) ?? "",
    weekKey: toDateKey(week.start),
  }));

  return (
    <article className="bg-card rounded-lg p-3 sm:p-4">
      <div className="flex items-start gap-2">
        <div className="text-muted-foreground hidden shrink-0 grid-rows-7 gap-0.75 pt-6 pr-3 text-right text-xs sm:grid">
          {DAY_LABELS.map((dayLabel) => (
            <span className="h-tile leading-tile" key={dayLabel.key}>
              {dayLabel.label}
            </span>
          ))}
        </div>

        <div className="overflow-x-auto overflow-y-visible">
          <div className="inline-block min-w-max pr-6 pb-1">
            <div className="text-muted-foreground mb-2 grid h-4 auto-cols-(--heatmap-tile-step) grid-flow-col text-xs">
              {monthLabelsByWeek.map((monthLabelByWeek) => (
                <span
                  className="w-tile-step whitespace-nowrap"
                  key={monthLabelByWeek.weekKey}
                >
                  {monthLabelByWeek.label}
                </span>
              ))}
            </div>

            <div className="gap-tile grid grid-flow-col grid-rows-7">
              {view.weeks.flatMap((week) =>
                week.values.map((day) => {
                  const isFuture = day.date > view.today;
                  const level = getLevel(day.value, config.range);
                  const bg = tileColor(config, level);
                  const dayTitle = config.formatDayTitle(day);

                  return (
                    <div
                      className={cn(
                        "rounded-tile size-tile",
                        isFuture
                          ? "bg-muted cursor-not-allowed opacity-50 dark:opacity-20"
                          : "transition-opacity duration-150 hover:opacity-85",
                      )}
                      key={toDateKey(day.date)}
                      style={isFuture ? undefined : { backgroundColor: bg }}
                      title={isFuture ? undefined : dayTitle}
                    />
                  );
                }),
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="text-muted-foreground mt-2 space-y-2 text-xs sm:mt-1">
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span className="tabular-nums">
            {config.formatSummary(
              view.totalValue,
              summaryRangeLabel ?? view.rangeLabel,
            )}
          </span>
          <div className="flex items-center gap-1">
            <span>Less</span>
            {COLOR_MIX_BY_LEVEL.map((mix, level) => (
              <div
                className="rounded-tile size-tile"
                key={`legend-${mix}`}
                style={{
                  backgroundColor: tileColor(config, level),
                }}
              />
            ))}
            <span>More</span>
          </div>
        </div>
      </div>
    </article>
  );
};
