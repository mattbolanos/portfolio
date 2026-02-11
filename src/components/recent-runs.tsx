import { RunningShoesIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { GetActivitiesResult } from "@/lib/api/strava";

type RecentRun = GetActivitiesResult["runActivities"][number];

const ACTIVITY_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  weekday: "short",
});
const MILES_FORMATTER = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

const WHOLE_NUMBER_FORMATTER = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

const METERS_PER_MILE = 1609.344;
const FEET_PER_METER = 3.28084;

const toMiles = (meters: number): number => meters / METERS_PER_MILE;
const toFeet = (meters: number): number => meters * FEET_PER_METER;

const formatDuration = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

interface RecentRunsProps {
  runs: RecentRun[];
}

export const RecentRuns = ({ runs }: RecentRunsProps) => {
  if (runs.length === 0) {
    return null;
  }

  return (
    <footer>
      <div className="mb-3 flex items-center gap-2">
        <HugeiconsIcon
          className="text-strava size-5 sm:size-6"
          icon={RunningShoesIcon}
        />
        <p className="text-muted-foreground text-xs tracking-wide uppercase">
          Latest runs
        </p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {runs.map((run) => (
          <article
            className="bg-muted/40 flex gap-3 overflow-hidden rounded-lg"
            key={run.id}
          >
            <div className="bg-strava w-[3px] shrink-0 rounded-l-xl" />
            <div className="flex flex-1 flex-col gap-1.5 py-2.5 pr-3">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-sm leading-none font-medium">
                  {MILES_FORMATTER.format(toMiles(run.distance))}
                  <span className="text-muted-foreground ml-0.5 text-[10px] font-normal">
                    mi
                  </span>
                </p>
                <time
                  className="text-muted-foreground text-[11px] tabular-nums"
                  dateTime={run.start_date_local}
                >
                  {ACTIVITY_DATE_FORMATTER.format(
                    new Date(run.start_date_local),
                  )}
                </time>
              </div>
              <div className="text-muted-foreground flex items-center gap-2.5 text-[11px] tabular-nums">
                <span title="Elevation gain">
                  +
                  {WHOLE_NUMBER_FORMATTER.format(
                    toFeet(run.total_elevation_gain),
                  )}
                  <span className="ml-0.5 opacity-60">ft</span>
                </span>
                <span
                  aria-hidden
                  className="bg-muted-foreground/30 h-2.5 w-px"
                />
                <span title="Duration">{formatDuration(run.moving_time)}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </footer>
  );
};
