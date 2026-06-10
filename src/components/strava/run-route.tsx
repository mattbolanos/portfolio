type LatLng = readonly [number, number];

const ROUTE_PREVIEW_SIZE = 52;
const ROUTE_PREVIEW_PADDING = 5;
const ROUTE_COORD_PRECISION = 1;
const ROUTE_MIN_POINT_DISTANCE = 0.35;
const MAX_ROUTE_PATH_CACHE_ENTRIES = 100;

const ROUTE_ANIM = {
  dotFadeOut: 0.5,
  drawDuration: 2.5,
  drawOffset: 0.3,
  spline: "0.22 1 0.36 1",
};

interface DecodedRoute {
  maxLat: number;
  maxLng: number;
  minLat: number;
  minLng: number;
  points: LatLng[];
}

const routePathCache = new Map<string, string | null>();

const decodePolyline = (encoded: string): DecodedRoute | null => {
  const points: LatLng[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;
  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;

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
    const decodedLat = lat / 1e5;
    const decodedLng = lng / 1e5;

    if (!Number.isFinite(decodedLat) || !Number.isFinite(decodedLng)) {
      return null;
    }

    minLat = Math.min(minLat, decodedLat);
    maxLat = Math.max(maxLat, decodedLat);
    minLng = Math.min(minLng, decodedLng);
    maxLng = Math.max(maxLng, decodedLng);
    points.push([decodedLat, decodedLng]);
  }

  if (points.length < 2) {
    return null;
  }

  return { maxLat, maxLng, minLat, minLng, points };
};

const formatRouteCoord = (value: number) =>
  value.toFixed(ROUTE_COORD_PRECISION);

const toRoutePath = ({
  maxLat,
  maxLng,
  minLat,
  minLng,
  points,
}: DecodedRoute): string | null => {
  const inner = ROUTE_PREVIEW_SIZE - ROUTE_PREVIEW_PADDING * 2;
  const lngRange = Math.max(maxLng - minLng, Number.EPSILON);
  const latRange = Math.max(maxLat - minLat, Number.EPSILON);
  const scale = Math.min(inner / lngRange, inner / latRange);
  const drawWidth = lngRange * scale;
  const drawHeight = latRange * scale;
  const xOffset = ROUTE_PREVIEW_PADDING + (inner - drawWidth) / 2;
  const yOffset = ROUTE_PREVIEW_PADDING + (inner - drawHeight) / 2;

  const commands: string[] = [];
  let previousX = Number.NaN;
  let previousY = Number.NaN;

  points.forEach(([lat, lng], index) => {
    const x = xOffset + (lng - minLng) * scale;
    const y = yOffset + (maxLat - lat) * scale;
    const isLast = index === points.length - 1;

    if (index > 0 && !isLast) {
      const dx = x - previousX;
      const dy = y - previousY;

      if (Math.hypot(dx, dy) < ROUTE_MIN_POINT_DISTANCE) {
        return;
      }
    }

    const command = commands.length === 0 ? "M" : "L";
    commands.push(`${command}${formatRouteCoord(x)} ${formatRouteCoord(y)}`);
    previousX = x;
    previousY = y;
  });

  return commands.length < 2 ? null : commands.join(" ");
};

const getRoutePath = (summaryPolyline: string): string | null => {
  if (routePathCache.has(summaryPolyline)) {
    return routePathCache.get(summaryPolyline) ?? null;
  }

  const decodedRoute = decodePolyline(summaryPolyline);
  const routePath = decodedRoute ? toRoutePath(decodedRoute) : null;

  if (routePathCache.size >= MAX_ROUTE_PATH_CACHE_ENTRIES) {
    const oldestKey = routePathCache.keys().next().value;

    if (oldestKey !== undefined) {
      routePathCache.delete(oldestKey);
    }
  }

  routePathCache.set(summaryPolyline, routePath);
  return routePath;
};

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

interface RunRouteProps {
  animationDelay: number;
  replayNonce: number;
  runName: string;
  summaryPolyline?: string | null;
}

const EmptyPreview = () => (
  <div className="bg-strava-route route-preview image-card grid shrink-0 place-items-center rounded-lg">
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

export const RunRoute = ({
  animationDelay,
  replayNonce,
  runName,
  summaryPolyline,
}: RunRouteProps) => {
  if (!summaryPolyline) return <EmptyPreview />;

  const routePath = getRoutePath(summaryPolyline);
  if (!routePath) return <EmptyPreview />;

  const uid = runName.replace(/\s+/g, "-");
  const drawDelay =
    replayNonce > 0 ? 0 : animationDelay + ROUTE_ANIM.drawOffset;
  const gradientId = `rg-${uid}`;
  const glowId = `rglow-${uid}`;
  const dotGlowId = `dglow-${uid}`;
  const terrainId = `terrain-${uid}`;

  return (
    <div className="bg-strava-route route-preview size-11 shrink-0 overflow-hidden rounded-lg sm:size-13">
      <svg
        aria-label={`${runName} route`}
        className="h-full w-full"
        key={replayNonce}
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
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
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
          d={routePath}
          fill="none"
          filter={`url(#${glowId})`}
          opacity={0.5}
          pathLength={1}
          stroke={`url(#${gradientId})`}
          strokeDasharray={1}
          strokeDashoffset={1}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={4}
        >
          <animate
            attributeName="stroke-dashoffset"
            begin={`${drawDelay}s`}
            calcMode="spline"
            dur={`${ROUTE_ANIM.drawDuration}s`}
            fill="freeze"
            keySplines={ROUTE_ANIM.spline}
            keyTimes="0;1"
            values="1;0"
          />
          <animate
            attributeName="opacity"
            begin={`${drawDelay}s`}
            dur={`${ROUTE_ANIM.drawDuration}s`}
            fill="freeze"
            keyTimes="0;0.8;1"
            values="0.5;0.45;0.2"
          />
        </path>

        {/* Main path stroke */}
        <path
          d={routePath}
          fill="none"
          pathLength={1}
          stroke={`url(#${gradientId})`}
          strokeDasharray={1}
          strokeDashoffset={1}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
        >
          <animate
            attributeName="stroke-dashoffset"
            begin={`${drawDelay}s`}
            calcMode="spline"
            dur={`${ROUTE_ANIM.drawDuration}s`}
            fill="freeze"
            keySplines={ROUTE_ANIM.spline}
            keyTimes="0;1"
            values="1;0"
          />
        </path>

        {/* Runner dot glow */}
        <circle
          fill="var(--strava)"
          filter={`url(#${dotGlowId})`}
          opacity={0}
          r={6.5}
        >
          <animateMotion
            begin={`${drawDelay}s`}
            calcMode="spline"
            dur={`${ROUTE_ANIM.drawDuration}s`}
            fill="freeze"
            keySplines={ROUTE_ANIM.spline}
            keyTimes="0;1"
            path={routePath}
          />
          <animate
            attributeName="opacity"
            begin={`${drawDelay}s`}
            dur={`${ROUTE_ANIM.drawDuration + ROUTE_ANIM.dotFadeOut}s`}
            fill="freeze"
            keyTimes="0;0.03;0.8;1"
            values="0.6;0.6;0.6;0"
          />
        </circle>

        {/* Runner dot */}
        <circle fill="var(--strava)" opacity={0} r={5}>
          <animateMotion
            begin={`${drawDelay}s`}
            calcMode="spline"
            dur={`${ROUTE_ANIM.drawDuration}s`}
            fill="freeze"
            keySplines={ROUTE_ANIM.spline}
            keyTimes="0;1"
            path={routePath}
          />
          <animate
            attributeName="opacity"
            begin={`${drawDelay}s`}
            dur={`${ROUTE_ANIM.drawDuration + ROUTE_ANIM.dotFadeOut}s`}
            fill="freeze"
            keyTimes="0;0.03;0.8;1"
            values="1;1;1;0"
          />
          <animate
            attributeName="r"
            begin={`${drawDelay + ROUTE_ANIM.drawDuration}s`}
            dur="0.35s"
            fill="freeze"
            keyTimes="0;0.5;1"
            values="5;6.5;5"
          />
        </circle>

        {/* Dot highlight core – subtle in light, prominent on dark */}
        <circle className="route-dot-core" fill="white" opacity={0} r={2.5}>
          <animateMotion
            begin={`${drawDelay}s`}
            calcMode="spline"
            dur={`${ROUTE_ANIM.drawDuration}s`}
            fill="freeze"
            keySplines={ROUTE_ANIM.spline}
            keyTimes="0;1"
            path={routePath}
          />
          <animate
            attributeName="opacity"
            begin={`${drawDelay}s`}
            dur={`${ROUTE_ANIM.drawDuration + ROUTE_ANIM.dotFadeOut}s`}
            fill="freeze"
            keyTimes="0;0.03;0.8;1"
            values="0.45;0.45;0.45;0"
          />
        </circle>
      </svg>
    </div>
  );
};
