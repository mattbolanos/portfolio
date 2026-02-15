import { DAY_LABELS, TILE_GAP, TILE_SIZE } from "@/lib/strava/heatmap";
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

/** Approximate month label positions across 52 weeks (~12 months). */
const MONTH_LABEL_POSITIONS = [0, 4, 9, 13, 17, 22, 26, 30, 35, 39, 43, 48];

export function ActivitiesWrapperSkeleton() {
  return (
    <>
      {/* Heatmap — matches <Card className="rounded-xl p-4"> */}
      <div className="ring-foreground/10 bg-card flex flex-col gap-6 overflow-hidden rounded-xl p-4 ring-1 sm:gap-4">
        <div className="flex justify-between gap-2">
          <div className="text-muted-foreground mt-6 hidden shrink-0 grid-rows-7 gap-1 text-xs sm:grid sm:gap-[3px]">
            {DAY_LABELS.map((dayLabel) => (
              <span className="h-3 leading-[11px]" key={dayLabel.key}>
                {dayLabel.label}
              </span>
            ))}
          </div>

          <div className="overflow-x-hidden">
            <div className="inline-block min-w-max pb-1">
              <div className="text-muted-foreground relative mb-2 h-4 text-xs">
                {MONTH_LABEL_POSITIONS.map((weekIndex) => (
                  <Skeleton
                    className="absolute top-0 h-3 w-5"
                    key={`month-${weekIndex}`}
                    style={{ left: weekIndex * (TILE_SIZE + TILE_GAP) }}
                  />
                ))}
              </div>

              <div className="grid grid-flow-col grid-rows-7 gap-[2px]">
                {HEATMAP_TILE_KEYS.map((tileKey) => (
                  <Skeleton
                    className="size-[11px] rounded-[3px]"
                    key={tileKey}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="text-muted-foreground mt-1 space-y-2 text-xs sm:mt-0.5">
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Skeleton className="h-5 w-44" />
            <div className="flex items-center gap-1">
              <Skeleton className="h-4 w-5" />
              {LEGEND_TILE_KEYS.map((tileKey) => (
                <Skeleton className="size-[11px] rounded-[3px]" key={tileKey} />
              ))}
              <Skeleton className="h-4 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent runs — matches <RecentRuns> */}
      <div className="space-y-1.5">
        {RUN_CARD_KEYS.map((runCardKey) => (
          <article
            className="bg-card ring-foreground/6 flex items-center gap-1.5 rounded-xl px-2.5 py-2 ring-1 sm:gap-3"
            key={runCardKey}
          >
            <Skeleton className="size-9 shrink-0 rounded-lg sm:size-11 sm:rounded-[10px]" />

            <div className="flex min-w-0 flex-1 flex-col">
              <Skeleton className="h-3.5 w-24 sm:h-4 sm:w-32" />
              <Skeleton className="mt-1 h-2.5 w-16 sm:h-3 sm:w-20" />
            </div>

            <div className="flex flex-col-reverse items-end gap-0.5 sm:flex-row sm:items-center sm:gap-2.5">
              <Skeleton className="h-3 w-10 sm:w-12" />
              <Skeleton className="h-3 w-16 sm:w-18" />
            </div>
          </article>
        ))}

        <Skeleton className="h-9 w-full rounded-xl" />
      </div>
    </>
  );
}
