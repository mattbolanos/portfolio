export type HeatmapEntry = {
  date: string;
  value: number;
};

export type HeatmapCell = {
  date: Date;
  value: number;
};

type HeatmapWeek = {
  start: Date;
  values: HeatmapCell[];
};

type HeatmapView = {
  today: Date;
  totalValue: number;
  weeks: HeatmapWeek[];
};

export type HeatmapConfig = {
  colorVar: string;
  formatDayTitle: (cell: HeatmapCell) => string;
  formatSummary: (total: number) => string;
  range: [min: number, max: number];
};

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

export const getLevel = (
  value: number,
  [min, max]: [number, number],
): number => {
  if (value <= min || max <= min) {
    return 0;
  }

  if (value >= max) {
    return 4;
  }

  return Math.ceil(((value - min) / (max - min)) * 3);
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
  entries: HeatmapEntry[],
  weeksToShow = WEEKS_TO_SHOW,
): HeatmapView => {
  const today = startOfDay(new Date());
  const entriesByDate = new Map(entries.map((entry) => [entry.date, entry]));
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
      const entry = entriesByDate.get(toDateKey(date));

      return {
        date,
        value: entry?.value ?? 0,
      };
    });

    weeks.push({ start: weekStart, values });
  }

  const days = weeks.flatMap((week) => week.values);

  return {
    today,
    totalValue: days.reduce((sum, day) => sum + day.value, 0),
    weeks,
  };
};
