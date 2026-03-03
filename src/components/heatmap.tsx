"use client";

import * as React from "react";
import {
  buildHeatmapView,
  buildMonthLabels,
  COLOR_MIX_BY_LEVEL,
  DAY_LABELS,
  getDayTitle,
  getLevel,
  type HeatmapDay,
  TILE_LEVEL_CLASS_BY_LEVEL,
  toDateKey,
} from "@/lib/strava/heatmap";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

interface HeatmapProps {
  heatmap: HeatmapDay[];
}

export const Heatmap = ({ heatmap }: HeatmapProps) => {
  const view = React.useMemo(() => buildHeatmapView(heatmap), [heatmap]);
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
    <article className="bg-card rounded-lg p-4">
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
                  const level = getLevel(day.miles, view.maxMiles);
                  const tileColorClass = TILE_LEVEL_CLASS_BY_LEVEL[level];

                  return (
                    <React.Fragment key={toDateKey(day.date)}>
                      {isFuture ? (
                        <div className="bg-muted rounded-tile size-tile hidden cursor-not-allowed opacity-50 sm:block dark:opacity-20" />
                      ) : (
                        <Tooltip disableHoverablePopup>
                          <TooltipTrigger
                            className={`hidden sm:block ${isScrolling ? "pointer-events-none" : ""}`}
                          >
                            <div
                              className={cn(
                                "rounded-tile size-tile transition-opacity duration-150 hover:opacity-85",
                                tileColorClass,
                              )}
                            />
                          </TooltipTrigger>
                          <TooltipContent>{getDayTitle(day)}</TooltipContent>
                        </Tooltip>
                      )}
                      <div
                        className={
                          isFuture
                            ? "bg-muted rounded-tile size-tile cursor-not-allowed opacity-50 sm:hidden dark:opacity-20"
                            : cn(
                                "rounded-tile size-tile transition-opacity duration-150 hover:opacity-85 sm:hidden",
                                tileColorClass,
                              )
                        }
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
          <span className="tabular-nums">{`${view.totalMiles.toFixed(1)} miles ran in the last year`}</span>
          <div className="flex items-center gap-1">
            <span>Less</span>
            {COLOR_MIX_BY_LEVEL.map((mix, level) => (
              <div
                className={cn(
                  "rounded-tile size-tile",
                  TILE_LEVEL_CLASS_BY_LEVEL[level],
                )}
                key={`legend-${mix}`}
              />
            ))}
            <span>More</span>
          </div>
        </div>
      </div>
    </article>
  );
};
