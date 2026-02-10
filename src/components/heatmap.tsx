"use client";

import type { GetActivitiesResult } from "@/lib/strava";

type HeatmapDay = GetActivitiesResult["heatmap"][number];

interface HeatmapProps {
  heatmap: HeatmapDay[];
}

const TILE_SIZE = 11;
const TILE_GAP = 3;
const WEEKS_TO_SHOW = 53;
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

export const Heatmap = ({ heatmap }: HeatmapProps) => {
  const today = startOfDay(new Date());
  const windowStart = addDays(today, -(WEEKS_TO_SHOW * 7 - 1));
  const gridStart = startOfWeek(windowStart);
  const gridEnd = endOfWeek(today);

  const daysByDate = new Map(heatmap.map((day) => [day.date, day]));
  const weeks: {
    start: Date;
    values: Array<{
      date: Date;
      miles: number;
      runCount: number;
    }>;
  }[] = [];

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

    weeks.push({ start: weekStart, values });
  }

  const maxMiles = Math.max(
    0,
    ...weeks.flatMap((week) => week.values.map((day) => day.miles)),
  );

  const monthLabels: Array<{ label: string; weekIndex: number }> = [];
  let previousMonth = -1;

  for (const [weekIndex, week] of weeks.entries()) {
    const month = week.start.getMonth();

    if (weekIndex === 0 || month !== previousMonth) {
      monthLabels.push({
        label: MONTH_FORMATTER.format(week.start),
        weekIndex,
      });
      previousMonth = month;
    }
  }

  const totalMiles = heatmap.reduce((sum, day) => sum + day.miles, 0);
  const totalRuns = heatmap.reduce((sum, day) => sum + day.runCount, 0);

  return (
    <section className="border-border bg-card rounded-xl border p-4">
      <div className="overflow-x-auto">
        <div className="inline-flex min-w-max gap-2">
          <div className="text-muted-foreground mt-6 grid grid-rows-7 gap-[3px] text-xs">
            <span className="h-[11px]" />
            <span className="h-[11px] leading-[11px]">Mon</span>
            <span className="h-[11px]" />
            <span className="h-[11px] leading-[11px]">Wed</span>
            <span className="h-[11px]" />
            <span className="h-[11px] leading-[11px]">Fri</span>
            <span className="h-[11px]" />
          </div>

          <div className="relative">
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
              {weeks.flatMap((week) =>
                week.values.map((day) => {
                  const level = getLevel(day.miles, maxMiles);
                  const milesText = day.miles.toFixed(2);
                  const runLabel = day.runCount === 1 ? "run" : "runs";
                  const title =
                    day.runCount === 0
                      ? `No running activity on ${DATE_FORMATTER.format(day.date)}`
                      : `${milesText} mi across ${day.runCount} ${runLabel} on ${DATE_FORMATTER.format(day.date)}`;

                  return (
                    <div
                      className="rounded-[2px]"
                      key={toDateKey(day.date)}
                      style={{
                        backgroundColor: getTileColor(level),
                        height: TILE_SIZE,
                        width: TILE_SIZE,
                      }}
                      title={title}
                    />
                  );
                }),
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="text-muted-foreground mt-4 flex flex-wrap items-center justify-between gap-2 text-xs">
        <p>{`${totalMiles.toFixed(1)} miles across ${totalRuns} runs in the last year`}</p>

        <div className="flex items-center gap-1.5">
          <span>Less</span>
          {COLOR_MIX_BY_LEVEL.map((mix, level) => (
            <div
              className="rounded-[2px]"
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
    </section>
  );
};
