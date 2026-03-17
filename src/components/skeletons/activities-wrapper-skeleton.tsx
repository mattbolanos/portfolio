import { Skeleton } from "@/components/ui/skeleton";
import { HeatmapSkeleton } from "./heatmap-skeleton";

const RUN_CARD_KEYS = ["run-card-1", "run-card-2", "run-card-3", "run-card-4"];

export const ActivitiesWrapperSkeleton = () => {
  return (
    <>
      <HeatmapSkeleton />

      {/* Recent runs — matches <RecentRuns> */}
      <div className="space-y-1.5">
        <Skeleton className="mt-1.5 h-9 w-full rounded-xl" />
        {RUN_CARD_KEYS.map((runCardKey) => (
          <article
            className="bg-card ring-foreground/6 flex items-center gap-1.5 rounded-lg px-2 py-2 ring-1 sm:gap-3 sm:px-2.5"
            key={runCardKey}
          >
            <Skeleton className="size-11 shrink-0 rounded-lg sm:size-13" />

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
      </div>
    </>
  );
};
