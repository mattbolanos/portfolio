import { Skeleton } from "@/components/ui/skeleton";
import { DAY_LABELS } from "@/lib/heatmap";

const LEGEND_TILE_KEYS = [
  "legend-tile-1",
  "legend-tile-2",
  "legend-tile-3",
  "legend-tile-4",
  "legend-tile-5",
];

interface HeatmapSkeletonProps {
  weeksToShow?: number;
}

export const HeatmapSkeleton = ({ weeksToShow = 52 }: HeatmapSkeletonProps) => {
  const heatmapTileKeys = Array.from(
    { length: 7 * weeksToShow },
    (_, index) => `heatmap-tile-${index + 1}`,
  );
  const heatmapWeekKeys = Array.from(
    { length: weeksToShow },
    (_, index) => index,
  );
  const monthLabelPositionSet = new Set(
    heatmapWeekKeys.filter(
      (weekIndex) => weekIndex === 0 || weekIndex % 4 === 0,
    ),
  );

  return (
    <article className="bg-card rounded-lg p-3 sm:p-4">
      <div className="flex items-start gap-2">
        <div className="text-muted-foreground mt-6 hidden shrink-0 pr-3 text-right grid-rows-7 text-xs sm:grid">
          {DAY_LABELS.map((dayLabel) => (
            <span className="h-tile leading-tile" key={dayLabel.key}>
              {dayLabel.label}
            </span>
          ))}
        </div>

        <div className="overflow-x-auto overflow-y-visible">
          <div className="inline-block min-w-max pb-1 pr-6">
            <div className="text-muted-foreground mb-2 grid h-4 auto-cols-(--heatmap-tile-step) grid-flow-col text-xs">
              {heatmapWeekKeys.map((weekIndex) => (
                <div className="w-tile-step" key={`month-${weekIndex}`}>
                  {monthLabelPositionSet.has(weekIndex) ? (
                    <Skeleton className="h-3 w-5" />
                  ) : null}
                </div>
              ))}
            </div>

            <div className="gap-tile grid grid-flow-col grid-rows-7">
              {heatmapTileKeys.map((tileKey) => (
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
  );
};
