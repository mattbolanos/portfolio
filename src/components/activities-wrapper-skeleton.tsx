import { Skeleton } from "./ui/skeleton";

const HEATMAP_TILE_KEYS = Array.from({ length: 7 * 52 }, (_, index) => {
  return `heatmap-tile-${index + 1}`;
});
const LEGEND_TILE_KEYS = [
  "legend-tile-1",
  "legend-tile-2",
  "legend-tile-3",
  "legend-tile-4",
  "legend-tile-5",
];
const RUN_CARD_KEYS = ["run-card-1", "run-card-2", "run-card-3"];

export function ActivitiesWrapperSkeleton() {
  return (
    <div className="bg-muted space-y-1.5 rounded-xl p-1.5">
      <div className="bg-card space-y-3 rounded-xl p-4">
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-24" />
        </div>

        <div className="overflow-x-hidden">
          <div className="grid w-max grid-flow-col grid-rows-7 gap-[2px]">
            {HEATMAP_TILE_KEYS.map((tileKey) => (
              <Skeleton className="size-[11px] rounded-[3px]" key={tileKey} />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-3 w-44" />
          <div className="hidden items-center gap-1 sm:flex">
            {LEGEND_TILE_KEYS.map((tileKey) => (
              <Skeleton className="size-[11px] rounded-[3px]" key={tileKey} />
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        {RUN_CARD_KEYS.map((runCardKey) => (
          <div
            className="bg-card ring-foreground/6 flex items-center gap-3 rounded-xl px-2.5 py-2 ring-1"
            key={runCardKey}
          >
            <Skeleton className="size-9 shrink-0 rounded-lg sm:size-11 sm:rounded-[10px]" />
            <div className="min-w-0 flex-1 space-y-1">
              <Skeleton className="h-4 w-24 sm:w-32" />
              <Skeleton className="h-3 w-16 sm:w-20" />
            </div>
            <div className="grid shrink-0 grid-cols-1 gap-1 sm:grid-cols-2 sm:gap-3">
              <Skeleton className="h-3 w-14" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        ))}

        <Skeleton className="h-9 w-full rounded-xl" />
      </div>
    </div>
  );
}
