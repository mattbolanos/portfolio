import { MountainIcon, RunningShoesIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { GetActivitiesResult } from "@/lib/api/strava";
import { RoutePreview } from "./route-preview";

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

interface ActivityCardProps {
  index: number;
  replayNonce: number;
  run: RecentRun;
}

export const ActivityCard = ({
  index,
  replayNonce,
  run,
}: ActivityCardProps) => {
  const delay = index * 0.1;

  return (
    <article
      className="animate-card-in bg-card ring-foreground/6 hover:ring-foreground/10 relative flex items-center gap-1.5 rounded-lg px-2.5 py-2 ring-1 transition-shadow duration-200 ease-out sm:gap-3"
      key={run.id}
      style={{ animationDelay: `${delay}s` }}
    >
      <RoutePreview
        animationDelay={delay}
        replayNonce={replayNonce}
        runName={run.name}
        summaryPolyline={run.map?.summary_polyline}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <p className="truncate text-xs leading-snug font-medium sm:text-sm">
          {run.name}
        </p>
        <time
          className="text-muted-foreground text-[10px] tabular-nums sm:text-xs"
          dateTime={run.start_date_local}
        >
          {ACTIVITY_DATE_FORMATTER.format(new Date(run.start_date_local))}
        </time>
      </div>

      <div className="text-muted-foreground flex flex-col-reverse items-end text-[10px] sm:flex-row sm:items-center sm:gap-2.5 sm:text-xs">
        <span className="flex items-center gap-[3px] tabular-nums sm:gap-1">
          <HugeiconsIcon
            className="hidden size-5 sm:block"
            icon={RunningShoesIcon}
          />
          <span className="text-foreground">
            {MILES_FORMATTER.format(toMiles(run.distance))}
          </span>
          <span>mi</span>
        </span>
        <span className="flex items-center gap-[3px] tabular-nums sm:gap-1">
          <HugeiconsIcon
            className="hidden size-5 sm:block"
            icon={MountainIcon}
          />
          <span className="text-foreground">
            {WHOLE_NUMBER_FORMATTER.format(toFeet(run.total_elevation_gain))}
          </span>
          <span>ft</span>
        </span>
      </div>
    </article>
  );
};
