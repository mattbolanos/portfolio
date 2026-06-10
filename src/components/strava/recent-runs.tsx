"use client";

import { ReplayIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import * as React from "react";
import { RunCard } from "@/components/strava/run-card";
import { Button } from "@/components/ui/button";
import type { GetActivitiesResult } from "@/lib/api/strava";

type RecentRun = GetActivitiesResult["latestRuns"][number];

interface RecentRunsProps {
  runs: RecentRun[];
}

export const RecentRuns = ({ runs }: RecentRunsProps) => {
  const [replayNonce, setReplayNonce] = React.useState(0);

  if (runs.length === 0) {
    return null;
  }

  const hasAnyRoute = runs.some((run) => Boolean(run.map?.summary_polyline));

  const handleReplay = () => {
    setReplayNonce((n) => n + 1);
  };

  return (
    <div className="space-y-1.5">
      {hasAnyRoute && (
        <Button className="mt-1.5 w-full rounded-lg" onClick={handleReplay}>
          <HugeiconsIcon className="size-5" icon={ReplayIcon} />
          Replay
        </Button>
      )}
      {runs.map((run, index) => (
        <RunCard
          index={index}
          key={run.id}
          replayNonce={replayNonce}
          run={run}
        />
      ))}
    </div>
  );
};
