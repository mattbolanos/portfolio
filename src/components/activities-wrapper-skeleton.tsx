import { DAY_LABELS } from "@/lib/strava/heatmap";
import { Skeleton } from "./ui/skeleton";

const HEATMAP_TILE_KEYS = Array.from({ length: 7 * 52 }, (_, index) => {
  return `heatmap-tile-${index + 1}`;
});
const HEATMAP_WEEK_KEYS = Array.from({ length: 52 }, (_, index) => index);

const LEGEND_TILE_KEYS = [
  "legend-tile-1",
  "legend-tile-2",
  "legend-tile-3",
  "legend-tile-4",
  "legend-tile-5",
];

const RUN_CARD_KEYS = ["run-card-1", "run-card-2", "run-card-3"];

const MONTH_LABEL_POSITIONS = [0, 4, 9, 13, 17, 22, 26, 30, 35, 39, 43, 48];
const MONTH_LABEL_POSITION_SET = new Set(MONTH_LABEL_POSITIONS);

export const ActivitiesWrapperSkeleton = () => {
  return (
    <>
      <article className="bg-card rounded-lg p-4">
        <div className="flex justify-between gap-2">
          <div className="text-muted-foreground mt-6 hidden shrink-0 grid-rows-7 text-xs sm:grid">
            {DAY_LABELS.map((dayLabel) => (
              <span className="h-tile leading-tile" key={dayLabel.key}>
                {dayLabel.label}
              </span>
            ))}
          </div>

          <div className="overflow-x-hidden">
            <div className="inline-block min-w-max pb-1">
              <div className="text-muted-foreground mb-2 grid h-4 auto-cols-(--heatmap-tile-step) grid-flow-col text-xs">
                {HEATMAP_WEEK_KEYS.map((weekIndex) => (
                  <div className="w-tile-step" key={`month-${weekIndex}`}>
                    {MONTH_LABEL_POSITION_SET.has(weekIndex) ? (
                      <Skeleton className="h-3 w-5" />
                    ) : null}
                  </div>
                ))}
              </div>

              <div className="gap-tile grid grid-flow-col grid-rows-7">
                {HEATMAP_TILE_KEYS.map((tileKey) => (
                  <Skeleton className="rounded-tile size-tile" key={tileKey} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="text-muted-foreground mt-2 space-y-2 text-xs sm:mt-1">
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Skeleton className="h-4 w-44" />
            <div className="flex items-center gap-1">
              <Skeleton className="h-4 w-5" />
              {LEGEND_TILE_KEYS.map((tileKey) => (
                <Skeleton className="rounded-tile size-tile" key={tileKey} />
              ))}
              <Skeleton className="h-4 w-6" />
            </div>
          </div>
        </div>
      </article>

      {/* Recent runs — matches <RecentRuns> */}
      <div className="space-y-1.5">
        {RUN_CARD_KEYS.map((runCardKey) => (
          <article
            className="bg-card ring-foreground/6 flex items-center gap-1.5 rounded-lg px-2.5 py-2 ring-1 sm:gap-3"
            key={runCardKey}
          >
            <Skeleton className="size-9 shrink-0 rounded-[10px] sm:size-11" />

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
};
