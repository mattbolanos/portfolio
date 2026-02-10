"use client";

import * as React from "react";
import type { GetActivitiesResult } from "@/lib/strava";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

type HeatmapDay = GetActivitiesResult["heatmap"][number];

interface HeatmapProps {
  heatmap: HeatmapDay[];
}

const TILE_SIZE = 11;
const TILE_GAP = 3;
const WEEKS_TO_SHOW = 36;
const MONTH_LABEL_MIN_WEEK_GAP = 3;
const DAY_LABELS = [
  { key: "sun", label: "" },
  { key: "mon", label: "Mon" },
  { key: "tue", label: "" },
  { key: "wed", label: "Wed" },
  { key: "thu", label: "" },
  { key: "fri", label: "Fri" },
  { key: "sat", label: "" },
] as const;
const MONTH_FORMATTER = new Intl.DateTimeFormat("en-US", { month: "short" });
const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  year: "numeric",
});
const COLOR_MIX_BY_LEVEL = [0, 30, 50, 75, 100];

const toDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const startOfDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const addDays = (date: Date, days: number): Date => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return startOfDay(next);
};

const startOfWeek = (date: Date): Date => addDays(date, -date.getDay());
const endOfWeek = (date: Date): Date => addDays(date, 6 - date.getDay());

const getLevel = (miles: number, maxMiles: number): number => {
  if (miles <= 0 || maxMiles <= 0) {
    return 0;
  }

  return Math.min(4, Math.max(1, Math.ceil((miles / maxMiles) * 4)));
};

const getTileColor = (level: number): string =>
  `color-mix(in oklch, var(--strava) ${COLOR_MIX_BY_LEVEL[level]}%, var(--muted))`;

type HeatmapWeek = {
  start: Date;
  values: Array<{
    date: Date;
    miles: number;
    runCount: number;
  }>;
  totalMiles: number;
};

type HeatmapView = {
  activeDays: number;
  bestWeekMiles: number;
  maxMiles: number;
  today: Date;
  totalMiles: number;
  totalRuns: number;
  weeks: HeatmapWeek[];
};

const buildHeatmapView = (
  daysByDate: Map<string, HeatmapDay>,
  today: Date,
  weeksToShow: number,
): HeatmapView => {
  const windowStart = addDays(today, -(weeksToShow * 7 - 1));
  const gridStart = startOfWeek(windowStart);
  const gridEnd = endOfWeek(today);

  const weeks: HeatmapWeek[] = [];

  for (
    let weekStart = gridStart;
    weekStart <= gridEnd;
    weekStart = addDays(weekStart, 7)
  ) {
    const values = Array.from({ length: 7 }, (_, dayOffset) => {
      const date = addDays(weekStart, dayOffset);
      const key = toDateKey(date);
      const day = daysByDate.get(key);

      return {
        date,
        miles: day?.miles ?? 0,
        runCount: day?.runCount ?? 0,
      };
    });

    const totalMiles = values.reduce((sum, day) => sum + day.miles, 0);
    weeks.push({ start: weekStart, totalMiles, values });
  }

  const days = weeks.flatMap((week) => week.values);
  const maxMiles = Math.max(0, ...days.map((day) => day.miles));
  const totalMiles = days.reduce((sum, day) => sum + day.miles, 0);
  const totalRuns = days.reduce((sum, day) => sum + day.runCount, 0);
  const activeDays = days.reduce(
    (sum, day) => (day.runCount > 0 ? sum + 1 : sum),
    0,
  );
  const bestWeekMiles = weeks.reduce(
    (max, week) => Math.max(max, week.totalMiles),
    0,
  );

  return {
    activeDays,
    bestWeekMiles,
    maxMiles,
    today,
    totalMiles,
    totalRuns,
    weeks,
  };
};

interface HeatmapWindowProps {
  view: HeatmapView;
  weeksToShow: number;
}

const HeatmapWindow = ({ view, weeksToShow }: HeatmapWindowProps) => {
  const renderedWeeks = view.weeks;
  const monthLabels: Array<{ label: string; weekIndex: number }> = [];
  let previousMonth = -1;
  let previousLabelWeekIndex = -Infinity;

  for (const [weekIndex, week] of renderedWeeks.entries()) {
    const month = week.start.getMonth();

    if (
      (weekIndex === 0 || month !== previousMonth) &&
      (weekIndex === 0 ||
        weekIndex - previousLabelWeekIndex >= MONTH_LABEL_MIN_WEEK_GAP)
    ) {
      monthLabels.push({
        label: MONTH_FORMATTER.format(week.start),
        weekIndex,
      });
      previousMonth = month;
      previousLabelWeekIndex = weekIndex;
      continue;
    }

    previousMonth = month;
  }

  return (
    <div>
      <div className="flex gap-2">
        <div className="text-muted-foreground mt-6 hidden shrink-0 grid-rows-7 gap-[3px] text-xs sm:grid">
          {DAY_LABELS.map((dayLabel) => (
            <span className="h-[11px] leading-[11px]" key={dayLabel.key}>
              {dayLabel.label}
            </span>
          ))}
        </div>

        <div className="heatmap-scroll overflow-x-auto overflow-y-hidden">
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

            <div className="grid grid-flow-col grid-rows-7 gap-[3px]">
              {renderedWeeks.flatMap((week) =>
                week.values.map((day) => {
                  const isFuture = day.date > view.today;
                  const level = getLevel(day.miles, view.maxMiles);
                  const milesText = day.miles.toFixed(2);
                  const runText =
                    day.runCount === 1 ? "1 run" : `${day.runCount} runs`;
                  const title =
                    day.runCount === 0
                      ? `No running activity on ${DATE_FORMATTER.format(day.date)}`
                      : `${runText}, ${milesText} mi on ${DATE_FORMATTER.format(day.date)}`;

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
                          <TooltipTrigger className="hidden sm:block">
                            <div
                              className="rounded-[3px] transition-opacity duration-150 hover:opacity-85"
                              style={{
                                backgroundColor: getTileColor(level),
                                height: TILE_SIZE,
                                width: TILE_SIZE,
                              }}
                            />
                          </TooltipTrigger>
                          <TooltipContent>{title}</TooltipContent>
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

      <div className="text-muted-foreground mt-4 space-y-2 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p>{`${view.totalMiles.toFixed(1)} miles across ${view.totalRuns} runs in the last ${weeksToShow} weeks`}</p>
          <div className="flex items-center gap-1.5">
            <span>Less</span>
            {COLOR_MIX_BY_LEVEL.map((mix, level) => (
              <div
                className="rounded-[3px]"
                key={`legend-${weeksToShow}-${mix}`}
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

        <div className="flex items-center gap-2.5">
          <span>{`${view.activeDays} active days`}</span>
          <span>{`Best week ${view.bestWeekMiles.toFixed(1)} mi`}</span>
        </div>
      </div>
    </div>
  );
};

export const Heatmap = ({ heatmap }: HeatmapProps) => {
  const today = startOfDay(new Date());
  const daysByDate = new Map(heatmap.map((day) => [day.date, day]));

  const view = buildHeatmapView(daysByDate, today, WEEKS_TO_SHOW);

  return (
    <div className="bg-muted space-y-1.5 rounded-xl p-1.5">
      <section className="border-border bg-card rounded-xl border p-4">
        <HeatmapWindow view={view} weeksToShow={WEEKS_TO_SHOW} />
      </section>
    </div>
  );
};
