"use client";

import {
  MountainIcon,
  ReplayIcon,
  RunningShoesIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import type { GetActivitiesResult } from "@/lib/api/strava";
import { Button } from "./ui/button";

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
const ROUTE_PREVIEW_SIZE = 52;
const ROUTE_PREVIEW_PADDING = 5;

const ROUTE_ANIM = {
  dotDuration: 1.3, // dot traces full route in this time
  dotOffset: 0.1, // dot starts slightly after path begins
  drawDuration: 1.3, // seconds for path to fully draw
  drawOffset: 0.2, // delay after card-in before route draws
  endPulseAt: 1.3, // end marker appears after dot finishes
  glowDuration: 1.5, // glow trail draws slightly slower
};

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

  const inner = ROUTE_PREVIEW_SIZE - ROUTE_PREVIEW_PADDING * 2;
  const lngRange = Math.max(maxLng - minLng, Number.EPSILON);
  const latRange = Math.max(maxLat - minLat, Number.EPSILON);
  const scale = Math.min(inner / lngRange, inner / latRange);
  const drawWidth = lngRange * scale;
  const drawHeight = latRange * scale;
  const xOffset = ROUTE_PREVIEW_PADDING + (inner - drawWidth) / 2;
  const yOffset = ROUTE_PREVIEW_PADDING + (inner - drawHeight) / 2;

  return points
    .map(([lat, lng], index) => {
      const x = xOffset + (lng - minLng) * scale;
      const y = yOffset + (maxLat - lat) * scale;
      const command = index === 0 ? "M" : "L";
      return `${command}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
};

/** Topographic contour lines + vignette for route preview background. */
const TerrainDefs = ({ id }: { id: string }) => (
  <defs>
    <pattern
      height="20"
      id={`${id}-topo`}
      patternUnits="userSpaceOnUse"
      width="20"
    >
      <path
        d="M10 2c4.5 0 7.5 3 8.5 5.5-1 3-4 4.5-8.5 4.5S3.5 10.5 2.5 7.5C3.5 5 6.5 2 10 2Z"
        fill="none"
        opacity="0.35"
        stroke="oklch(0.55 0.1 145)"
        strokeWidth="0.35"
      />
      <path
        d="M10 5.5c2.5 0 4.5 1 5.5 2.5-1 2-2.5 2.5-5.5 2.5S5.5 10 4.5 8C5.5 6.5 7.5 5.5 10 5.5Z"
        fill="none"
        opacity="0.25"
        stroke="oklch(0.55 0.1 145)"
        strokeWidth="0.35"
      />
      <ellipse
        cx="10"
        cy="8"
        fill="none"
        opacity="0.15"
        rx="2"
        ry="1"
        stroke="oklch(0.55 0.1 145)"
        strokeWidth="0.35"
      />
    </pattern>
    <radialGradient cx="50%" cy="50%" id={`${id}-vignette`} r="65%">
      <stop offset="0%" stopColor="transparent" />
      <stop offset="100%" stopColor="oklch(0 0 0 / 0.08)" />
    </radialGradient>
  </defs>
);

interface RoutePreviewProps {
  animationDelay: number;
  replayNonce: number;
  runName: string;
  summaryPolyline?: string | null;
}

const EmptyPreview = () => (
  <div className="route-preview-empty grid shrink-0 place-items-center rounded-lg sm:rounded-[10px]">
    <svg
      aria-hidden="true"
      className="h-full w-full"
      viewBox={`0 0 ${ROUTE_PREVIEW_SIZE} ${ROUTE_PREVIEW_SIZE}`}
    >
      <TerrainDefs id="empty" />
      <rect
        fill="url(#empty-topo)"
        height={ROUTE_PREVIEW_SIZE}
        width={ROUTE_PREVIEW_SIZE}
      />
    </svg>
  </div>
);

const RoutePreview = ({
  animationDelay,
  replayNonce,
  runName,
  summaryPolyline,
}: RoutePreviewProps) => {
  if (!summaryPolyline) return <EmptyPreview />;

  const points = decodePolyline(summaryPolyline);
  const routePath = toRoutePath(points);
  if (!routePath) return <EmptyPreview />;

  const uid = runName.replace(/\s+/g, "-");
  const drawDelay =
    replayNonce > 0 ? 0 : animationDelay + ROUTE_ANIM.drawOffset;
  const dotDelay = drawDelay + ROUTE_ANIM.dotOffset;
  const gradientId = `rg-${replayNonce}-${uid}`;
  const glowId = `rglow-${replayNonce}-${uid}`;
  const dotGlowId = `dglow-${replayNonce}-${uid}`;
  const terrainId = `terrain-${uid}`;

  // Extract start and end coordinates from the route path
  const firstPoint = routePath.match(/^M([\d.]+) ([\d.]+)/);
  const allPoints = [...routePath.matchAll(/[ML]([\d.]+) ([\d.]+)/g)];
  const lastPoint = allPoints[allPoints.length - 1];

  const startX = firstPoint ? parseFloat(firstPoint[1]) : 0;
  const startY = firstPoint ? parseFloat(firstPoint[2]) : 0;
  const endX = lastPoint ? parseFloat(lastPoint[1]) : 0;
  const endY = lastPoint ? parseFloat(lastPoint[2]) : 0;

  return (
    <div className="route-preview shrink-0 overflow-hidden rounded-lg sm:rounded-[10px]">
      <svg
        aria-label={`${runName} route`}
        className="h-full w-full"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        viewBox={`0 0 ${ROUTE_PREVIEW_SIZE} ${ROUTE_PREVIEW_SIZE}`}
      >
        <title>{`${runName} route`}</title>
        <TerrainDefs id={terrainId} />
        <defs>
          <linearGradient
            gradientUnits="userSpaceOnUse"
            id={gradientId}
            x1="0%"
            x2="100%"
            y1="0%"
            y2="100%"
          >
            <stop offset="0%" stopColor="oklch(0.75 0.19 40)" />
            <stop offset="100%" stopColor="var(--strava)" />
          </linearGradient>
          <filter id={glowId}>
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
          </filter>
          <filter id={dotGlowId}>
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" />
          </filter>
        </defs>

        {/* Terrain contours */}
        <rect
          fill={`url(#${terrainId}-topo)`}
          height={ROUTE_PREVIEW_SIZE}
          width={ROUTE_PREVIEW_SIZE}
        />
        <rect
          fill={`url(#${terrainId}-vignette)`}
          height={ROUTE_PREVIEW_SIZE}
          width={ROUTE_PREVIEW_SIZE}
        />

        {/* Ghost/shadow path */}
        <path
          d={routePath}
          fill="none"
          opacity="0.1"
          stroke="oklch(0.3 0.05 145)"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={5}
        />

        {/* Glow trail */}
        <path
          className="animate-draw-route-glow"
          d={routePath}
          fill="none"
          filter={`url(#${glowId})`}
          key={`glow-${replayNonce}`}
          pathLength={1}
          stroke={`url(#${gradientId})`}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={4}
          style={{ animationDelay: `${drawDelay}s` }}
        />

        {/* Main crisp stroke */}
        <path
          className="animate-draw-route"
          d={routePath}
          fill="none"
          key={`draw-${replayNonce}`}
          pathLength={1}
          stroke={`url(#${gradientId})`}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          style={{ animationDelay: `${drawDelay}s` }}
        />

        {/* Start marker */}
        <circle
          className="animate-route-marker"
          cx={startX}
          cy={startY}
          fill="oklch(0.95 0.02 145)"
          key={`start-${replayNonce}`}
          r={2}
          stroke="oklch(0.55 0.12 145)"
          strokeWidth={0.8}
          style={{ animationDelay: `${drawDelay}s` }}
        />

        {/* Runner dot glow — comet trail effect */}
        <circle
          fill="var(--strava)"
          filter={`url(#${dotGlowId})`}
          key={`dot-glow-${replayNonce}`}
          opacity={0}
          r={3.5}
        >
          <animateMotion
            begin={`${dotDelay}s`}
            dur={`${ROUTE_ANIM.dotDuration}s`}
            fill="freeze"
            key={`dotglow-motion-${replayNonce}`}
            path={routePath}
          />
          <animate
            attributeName="opacity"
            begin={`${dotDelay}s`}
            dur={`${ROUTE_ANIM.dotDuration}s`}
            fill="freeze"
            key={`dotglow-opacity-${replayNonce}`}
            values="0;0.7;0.7;0"
          />
        </circle>

        {/* Runner dot — crisp white circle tracing the route */}
        <circle
          fill="white"
          key={`dot-${replayNonce}`}
          opacity={0}
          r={1.8}
          stroke="var(--strava)"
          strokeWidth={1}
        >
          <animateMotion
            begin={`${dotDelay}s`}
            dur={`${ROUTE_ANIM.dotDuration}s`}
            fill="freeze"
            key={`dot-motion-${replayNonce}`}
            path={routePath}
          />
          <animate
            attributeName="opacity"
            begin={`${dotDelay}s`}
            dur={`${ROUTE_ANIM.dotDuration}s`}
            fill="freeze"
            key={`dot-vis-${replayNonce}`}
            values="0;1;1;0"
          />
        </circle>

        {/* End marker — pulses in at finish point */}
        <circle
          className="animate-route-end-pulse"
          cx={endX}
          cy={endY}
          fill="var(--strava)"
          key={`end-${replayNonce}`}
          r={2.2}
          style={{ animationDelay: `${drawDelay + ROUTE_ANIM.endPulseAt}s` }}
        />
      </svg>
    </div>
  );
};

interface RecentRunsProps {
  runs: RecentRun[];
}

export const RecentRuns = ({ runs }: RecentRunsProps) => {
  const [replayNonce, setReplayNonce] = useState(0);

  if (runs.length === 0) {
    return null;
  }

  const hasAnyRoute = runs.some((run) => Boolean(run.map?.summary_polyline));

  const handleReplay = () => {
    setReplayNonce((n) => n + 1);
  };

  return (
    <div className="space-y-1.5">
      {runs.map((run, index) => {
        const delay = index * 0.1;

        return (
          <article
            className="animate-card-in run-card bg-card ring-foreground/6 hover:ring-foreground/10 flex items-center gap-1.5 rounded-xl px-2.5 py-2 ring-1 transition-all duration-200 ease-out sm:gap-3"
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

            <div className="grid shrink-0 grid-cols-1 text-[11px] sm:grid-cols-2 sm:gap-3 sm:text-xs">
              <span className="flex items-center gap-1 tabular-nums">
                <HugeiconsIcon
                  className="size-4 opacity-50"
                  icon={RunningShoesIcon}
                />
                {MILES_FORMATTER.format(toMiles(run.distance))}
                <span>mi</span>
              </span>
              <span className="text-muted-foreground flex items-center gap-1 tabular-nums">
                <HugeiconsIcon
                  className="size-4 opacity-50"
                  icon={MountainIcon}
                />
                {WHOLE_NUMBER_FORMATTER.format(
                  toFeet(run.total_elevation_gain),
                )}
                <span>ft</span>
              </span>
            </div>
          </article>
        );
      })}

      {hasAnyRoute && (
        <Button className="w-full rounded-xl" onClick={handleReplay}>
          <HugeiconsIcon className="size-5" icon={ReplayIcon} />
          Replay
        </Button>
      )}
    </div>
  );
};
