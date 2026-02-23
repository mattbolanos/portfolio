import type { GetActivitiesResult } from "@/lib/api/strava";

export type HeatmapDay = GetActivitiesResult["heatmap"][number];

type HeatmapCell = {
  date: Date;
  miles: number;
  runCount: number;
};

type HeatmapWeek = {
  start: Date;
  values: HeatmapCell[];
};

type HeatmapView = {
  maxMiles: number;
  today: Date;
  totalMiles: number;
  weeks: HeatmapWeek[];
};

export const TILE_SIZE = 11;
export const TILE_GAP = 2;
const WEEKS_TO_SHOW = 52;
export const DAY_LABELS = [
  { key: "sun", label: "" },
  { key: "mon", label: "Mon" },
  { key: "tue", label: "" },
  { key: "wed", label: "Wed" },
  { key: "thu", label: "" },
  { key: "fri", label: "Fri" },
  { key: "sat", label: "" },
] as const;
export const COLOR_MIX_BY_LEVEL = [0, 30, 50, 75, 100] as const;

const MONTH_LABEL_MIN_WEEK_GAP = 3;
const MONTH_FORMATTER = new Intl.DateTimeFormat("en-US", { month: "short" });
const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const startOfDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const addDays = (date: Date, days: number): Date => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return startOfDay(next);
};

const startOfWeek = (date: Date): Date => addDays(date, -date.getDay());
const endOfWeek = (date: Date): Date => addDays(date, 6 - date.getDay());

export const toDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getLevel = (miles: number, maxMiles: number): number => {
  if (miles <= 0 || maxMiles <= 0) {
    return 0;
  }

  return Math.min(4, Math.max(1, Math.ceil((miles / maxMiles) * 4)));
};

export const getTileColor = (level: number): string =>
  `color-mix(in oklch, var(--strava) ${COLOR_MIX_BY_LEVEL[level]}%, var(--muted))`;

export const getDayTitle = (day: HeatmapCell): string => {
  const formattedDate = DATE_FORMATTER.format(day.date);

  if (day.runCount === 0) {
    return `No miles run on ${formattedDate}`;
  }

  return `${day.miles.toFixed(2)} miles on ${formattedDate}`;
};

export const buildMonthLabels = (
  weeks: HeatmapWeek[],
): Array<{ label: string; weekIndex: number }> => {
  const monthLabels: Array<{ label: string; weekIndex: number }> = [];
  let previousMonth = -1;
  let previousLabelWeekIndex = -Infinity;

  for (const [weekIndex, week] of weeks.entries()) {
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

  return monthLabels;
};

export const buildHeatmapView = (
  heatmap: HeatmapDay[],
  weeksToShow = WEEKS_TO_SHOW,
): HeatmapView => {
  const today = startOfDay(new Date());
  const daysByDate = new Map(heatmap.map((day) => [day.date, day]));
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
      const day = daysByDate.get(toDateKey(date));

      return {
        date,
        miles: day?.miles ?? 0,
        runCount: day?.runCount ?? 0,
      };
    });

    weeks.push({ start: weekStart, values });
  }

  const days = weeks.flatMap((week) => week.values);

  return {
    maxMiles: Math.max(0, ...days.map((day) => day.miles)) - 4,
    today,
    totalMiles: days.reduce((sum, day) => sum + day.miles, 0),
    weeks,
  };
};
