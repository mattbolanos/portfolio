"use client";

import { ReplayIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import type { GetActivitiesResult } from "@/lib/api/strava";
import { ActivityCard } from "./activity-card";
import { Button } from "./ui/button";

type RecentRun = GetActivitiesResult["runActivities"][number];
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
      {hasAnyRoute && (
        <Button className="w-full rounded-lg" onClick={handleReplay}>
          <HugeiconsIcon className="size-5" icon={ReplayIcon} />
          Replay
        </Button>
      )}
      {runs.map((run, index) => (
        <ActivityCard
          index={index}
          key={run.id}
          replayNonce={replayNonce}
          run={run}
        />
      ))}
    </div>
  );
};
