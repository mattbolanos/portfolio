"use client";

import * as React from "react";
import {
  buildHeatmapView,
  buildMonthLabels,
  COLOR_MIX_BY_LEVEL,
  DAY_LABELS,
  getLevel,
  type HeatmapEntry,
  toDateKey,
} from "@/lib/heatmap";
import { getHeatmapConfig, type HeatmapConfigId } from "@/lib/heatmap/configs";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

interface HeatmapProps {
  configId: HeatmapConfigId;
  data: HeatmapEntry[];
}

const tileColor = (colorVar: string, level: number): string =>
  `color-mix(in oklch, var(${colorVar}) ${COLOR_MIX_BY_LEVEL[level]}%, var(--empty))`;

export const Heatmap = ({ configId, data }: HeatmapProps) => {
  const config = getHeatmapConfig(configId);
  const view = React.useMemo(() => buildHeatmapView(data), [data]);
  const monthLabels = React.useMemo(
    () => buildMonthLabels(view.weeks),
    [view.weeks],
  );
  const monthLabelsByWeek = React.useMemo(() => {
    const labels = new Map(
      monthLabels.map((monthLabel) => [monthLabel.weekIndex, monthLabel.label]),
    );

    return view.weeks.map((week, weekIndex) => ({
      label: labels.get(weekIndex) ?? "",
      weekKey: toDateKey(week.start),
    }));
  }, [monthLabels, view.weeks]);
  const [isScrolling, setIsScrolling] = React.useState(false);
  const scrollTimeoutRef = React.useRef<number | null>(null);

  const handleHeatmapScroll = React.useCallback(() => {
    setIsScrolling(true);

    if (scrollTimeoutRef.current !== null) {
      window.clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = window.setTimeout(() => {
      setIsScrolling(false);
      scrollTimeoutRef.current = null;
    }, 100);
  }, []);

  return (
    <article className="bg-card rounded-lg p-3 sm:p-4">
      <div className="flex justify-between gap-2">
        <div className="text-muted-foreground mt-6 hidden shrink-0 grid-rows-7 text-xs sm:grid">
          {DAY_LABELS.map((dayLabel) => (
            <span className="h-tile leading-tile" key={dayLabel.key}>
              {dayLabel.label}
            </span>
          ))}
        </div>

        <div
          className="overflow-x-auto overflow-y-hidden"
          onScroll={handleHeatmapScroll}
        >
          <div className="inline-block min-w-max pb-1">
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
                  const bg = tileColor(config.colorVar, level);

                  return (
                    <React.Fragment key={toDateKey(day.date)}>
                      {isFuture ? (
                        <div className="bg-muted rounded-tile size-tile hidden cursor-not-allowed opacity-50 sm:block dark:opacity-20" />
                      ) : (
                        <Tooltip disableHoverablePopup>
                          <TooltipTrigger
                            className={cn(
                              "size-tile hidden sm:inline-flex",
                              isScrolling ? "pointer-events-none" : "",
                            )}
                          >
                            <div
                              className="rounded-tile size-tile transition-opacity duration-150 hover:opacity-85"
                              style={{ backgroundColor: bg }}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            {config.formatDayTitle(day)}
                          </TooltipContent>
                        </Tooltip>
                      )}
                      <div
                        className={
                          isFuture
                            ? "bg-muted rounded-tile size-tile cursor-not-allowed opacity-50 sm:hidden dark:opacity-20"
                            : "rounded-tile size-tile transition-opacity duration-150 hover:opacity-85 sm:hidden"
                        }
                        style={isFuture ? undefined : { backgroundColor: bg }}
                      />
                    </React.Fragment>
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
            {config.formatSummary(view.totalValue)}
          </span>
          <div className="flex items-center gap-1">
            <span>Less</span>
            {COLOR_MIX_BY_LEVEL.map((mix, level) => (
              <div
                className="rounded-tile size-tile"
                key={`legend-${mix}`}
                style={{
                  backgroundColor: tileColor(config.colorVar, level),
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
