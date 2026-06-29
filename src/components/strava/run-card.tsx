"use client";

import { MountainIcon, RunningShoesIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { RunRoute } from "@/components/strava/run-route";
import type { GetActivitiesResult } from "@/lib/api/strava";

type RecentRun = GetActivitiesResult["latestRuns"][number];

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

const getRunTitle = (startDateLocal: string): string => {
  const hour = new Date(startDateLocal).getHours();

  if (hour < 12) return "Morning Run";
  if (hour < 17) return "Afternoon Run";

  return "Evening Run";
};

interface RunCardProps {
  index: number;
  replayNonce: number;
  run: RecentRun;
}

export const RunCard = ({ index, replayNonce, run }: RunCardProps) => {
  const runTitle = getRunTitle(run.start_date_local);

  return (
    <article
      className="bg-card ring-foreground/6 hover:ring-foreground/10 relative flex items-center gap-1.5 rounded-lg px-2 py-2 ring-1 transition-shadow duration-200 ease-out sm:gap-3 sm:px-2.5"
      key={run.id}
    >
      <RunRoute
        animationDelay={index * 0.1}
        replayNonce={replayNonce}
        runName={runTitle}
        summaryPolyline={run.map?.summary_polyline}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <p className="truncate text-xs leading-snug font-medium sm:text-sm">
          {runTitle}
        </p>
        <time
          className="text-muted-foreground text-[10px] tabular-nums sm:text-xs"
          dateTime={run.start_date_local}
          suppressHydrationWarning
        >
          {ACTIVITY_DATE_FORMATTER.format(new Date(run.start_date_local))}
        </time>
      </div>

      <div className="text-muted-foreground flex flex-col items-end text-[10px] sm:flex-row sm:items-center sm:gap-2.5 sm:text-xs">
        <span className="flex items-center gap-0.75 tabular-nums sm:gap-1">
          <HugeiconsIcon
            className="hidden size-5 sm:block"
            icon={RunningShoesIcon}
          />
          <span className="text-foreground">
            {MILES_FORMATTER.format(toMiles(run.distance))}
          </span>
          <span className="font-mono tracking-tight">mi</span>
        </span>
        <span className="flex items-center gap-0.75 tabular-nums sm:gap-1">
          <HugeiconsIcon
            className="hidden size-5 sm:block"
            icon={MountainIcon}
          />
          <span className="text-foreground">
            {WHOLE_NUMBER_FORMATTER.format(toFeet(run.total_elevation_gain))}
          </span>
          <span className="font-mono tracking-tight">ft</span>
        </span>
      </div>
    </article>
  );
};
