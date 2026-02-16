"use client";

import * as React from "react";
import {
  buildHeatmapView,
  buildMonthLabels,
  COLOR_MIX_BY_LEVEL,
  DAY_LABELS,
  getDayTitle,
  getLevel,
  getTileColor,
  type HeatmapDay,
  TILE_GAP,
  TILE_SIZE,
  toDateKey,
} from "@/lib/strava/heatmap";
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
            <span className="h-[11px] leading-[11px]" key={dayLabel.key}>
              {dayLabel.label}
            </span>
          ))}
        </div>

        <div
          className="overflow-x-auto overflow-y-hidden"
          onScroll={handleHeatmapScroll}
        >
          <div className="inline-block min-w-max pb-1">
            <div className="text-muted-foreground relative mb-2 h-4 text-xs">
              {monthLabels.map((month) => (
                <span
                  className="absolute top-0 whitespace-nowrap"
                  key={`${month.label}-${month.weekIndex}`}
                  style={{ left: month.weekIndex * (TILE_SIZE + TILE_GAP) }}
                >
                  {month.label}
                </span>
              ))}
            </div>

            <div className="grid grid-flow-col grid-rows-7 gap-[2px]">
              {view.weeks.flatMap((week) =>
                week.values.map((day) => {
                  const isFuture = day.date > view.today;
                  const level = getLevel(day.miles, view.maxMiles);

                  return (
                    <React.Fragment key={toDateKey(day.date)}>
                      {isFuture ? (
                        <div
                          className="bg-muted hidden cursor-not-allowed rounded-[3px] opacity-50 sm:block dark:opacity-35"
                          style={{
                            height: TILE_SIZE,
                            width: TILE_SIZE,
                          }}
                        />
                      ) : (
                        <Tooltip disableHoverablePopup>
                          <TooltipTrigger
                            className={`hidden sm:block ${isScrolling ? "pointer-events-none" : ""}`}
                          >
                            <div
                              className="rounded-[3px] transition-opacity duration-150 hover:opacity-85"
                              style={{
                                backgroundColor: getTileColor(level),
                                height: TILE_SIZE,
                                width: TILE_SIZE,
                              }}
                            />
                          </TooltipTrigger>
                          <TooltipContent>{getDayTitle(day)}</TooltipContent>
                        </Tooltip>
                      )}
                      <div
                        className={
                          isFuture
                            ? "bg-muted cursor-not-allowed rounded-[3px] opacity-50 sm:hidden dark:opacity-35"
                            : "rounded-[3px] transition-opacity duration-150 hover:opacity-85 sm:hidden"
                        }
                        style={{
                          backgroundColor: isFuture
                            ? undefined
                            : getTileColor(level),
                          height: TILE_SIZE,
                          width: TILE_SIZE,
                        }}
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
                className="rounded-[3px]"
                key={`legend-${mix}`}
                style={{
                  backgroundColor: getTileColor(level),
                  height: TILE_SIZE,
                  width: TILE_SIZE,
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
