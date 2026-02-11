import { MountainIcon, RunningShoesIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { GetActivitiesResult } from "@/lib/api/strava";

type RecentRun = GetActivitiesResult["runActivities"][number];
type LatLng = readonly [number, number];

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
const ROUTE_PREVIEW_WIDTH = 80;
const ROUTE_PREVIEW_HEIGHT = 56;
const ROUTE_PREVIEW_PADDING = 8;

const toMiles = (meters: number): number => meters / METERS_PER_MILE;
const toFeet = (meters: number): number => meters * FEET_PER_METER;

const decodePolyline = (encoded: string): LatLng[] => {
  const points: LatLng[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let result = 0;
    let shift = 0;
    let byte = 0;

    do {
      byte = encoded.charCodeAt(index) - 63;
      index += 1;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    lat += (result & 1) !== 0 ? ~(result >> 1) : result >> 1;

    result = 0;
    shift = 0;

    do {
      byte = encoded.charCodeAt(index) - 63;
      index += 1;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    lng += (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    points.push([lat / 1e5, lng / 1e5]);
  }

  return points;
};

const toRoutePath = (points: LatLng[]): string | null => {
  if (points.length < 2) {
    return null;
  }

  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;

  for (const [lat, lng] of points) {
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return null;
    }

    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
  }

  const innerWidth = ROUTE_PREVIEW_WIDTH - ROUTE_PREVIEW_PADDING * 2;
  const innerHeight = ROUTE_PREVIEW_HEIGHT - ROUTE_PREVIEW_PADDING * 2;
  const lngRange = Math.max(maxLng - minLng, Number.EPSILON);
  const latRange = Math.max(maxLat - minLat, Number.EPSILON);
  const scale = Math.min(innerWidth / lngRange, innerHeight / latRange);
  const drawWidth = lngRange * scale;
  const drawHeight = latRange * scale;
  const xOffset = ROUTE_PREVIEW_PADDING + (innerWidth - drawWidth) / 2;
  const yOffset = ROUTE_PREVIEW_PADDING + (innerHeight - drawHeight) / 2;

  return points
    .map(([lat, lng], index) => {
      const x = xOffset + (lng - minLng) * scale;
      const y = yOffset + (maxLat - lat) * scale;
      const command = index === 0 ? "M" : "L";
      return `${command}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
};

interface RoutePreviewProps {
  runName: string;
  summaryPolyline?: string | null;
}

const RoutePreview = ({ runName, summaryPolyline }: RoutePreviewProps) => {
  if (!summaryPolyline) {
    return (
      <div className="bg-muted grid h-10 w-14 shrink-0 place-items-center rounded-lg">
        <svg
          aria-hidden="true"
          className="text-muted-foreground/30 size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
        >
          <path
            d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }

  const routePath = toRoutePath(decodePolyline(summaryPolyline));

  if (!routePath) {
    return (
      <div className="bg-muted grid h-10 w-14 shrink-0 place-items-center rounded-lg">
        <svg
          aria-hidden="true"
          className="text-muted-foreground/30 size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
        >
          <path
            d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className="ring-strava/20 h-10 w-14 shrink-0 overflow-hidden rounded-md bg-emerald-50/50 ring-1 dark:bg-emerald-950/50">
      <svg
        aria-label={`${runName} route`}
        className="h-full w-full"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        viewBox={`0 0 ${ROUTE_PREVIEW_WIDTH} ${ROUTE_PREVIEW_HEIGHT}`}
      >
        <title>{`${runName} route`}</title>
        <path
          className="text-strava/20"
          d={routePath}
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={6}
        />
        <path
          className="text-strava"
          d={routePath}
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
        />
      </svg>
    </div>
  );
};

interface RecentRunsProps {
  runs: RecentRun[];
}

export const RecentRuns = ({ runs }: RecentRunsProps) => {
  if (runs.length === 0) {
    return null;
  }

  return (
    <footer className="space-y-1.5">
      <p className="text-muted-foreground px-2 pt-0.5 text-[11px] tracking-widest uppercase">
        Recent runs
      </p>
      <div className="space-y-1">
        {runs.map((run) => (
          <article
            className="bg-card ring-foreground/6 flex items-center gap-3 rounded-xl px-2.5 py-2 ring-1"
            key={run.id}
          >
            {/* Route thumbnail */}
            <RoutePreview
              runName={run.name}
              summaryPolyline={run.map?.summary_polyline}
            />

            {/* Name + date */}
            <div className="min-w-0 flex-1">
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

            {/* Stats */}
            <div className="flex shrink-0 items-center gap-2.5">
              <span className="flex items-center gap-1 text-xs tabular-nums">
                <HugeiconsIcon className="size-4.5" icon={RunningShoesIcon} />
                {MILES_FORMATTER.format(toMiles(run.distance))} mi
              </span>
              <span className="text-muted-foreground flex items-center gap-1 text-xs tabular-nums">
                <HugeiconsIcon className="size-4.5" icon={MountainIcon} />
                {WHOLE_NUMBER_FORMATTER.format(
                  toFeet(run.total_elevation_gain),
                )}{" "}
                ft
              </span>
            </div>
          </article>
        ))}
      </div>
    </footer>
  );
};
