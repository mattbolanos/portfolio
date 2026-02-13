import Link from "next/link";
import { Suspense } from "react";
import { ActivitiesWrapperSkeleton } from "@/components/activities-wrapper-skeleton";
import { ContactLinks } from "@/components/contact-links";
import { Experience } from "@/components/experience";
import { Heatmap } from "@/components/heatmap";
import { RecentRuns } from "@/components/recent-runs";
import { TrackCard, TrackCardSkeleton } from "@/components/track-card";
import { getRecentTracks } from "@/lib/api/last-fm";
import { type GetActivitiesResult, getActivities } from "@/lib/api/strava";

type RecentRun = GetActivitiesResult["runActivities"][number];

const selectLatestRuns = (runs: RecentRun[], limit = 3): RecentRun[] =>
  [...runs]
    .sort(
      (runA, runB) =>
        new Date(runB.start_date_local).getTime() -
        new Date(runA.start_date_local).getTime(),
    )
    .slice(0, limit);

async function RecentTrackWrapper() {
  const tracks = await getRecentTracks(3);

  if (!tracks || tracks.length === 0) {
    return null;
  }

  return <TrackCard tracks={tracks} />;
}

async function ActivitiesPreviewWrapper() {
  const activities = await getActivities({
    maxPages: 6,
    perPage: 100,
  });

  if (!activities) {
    return (
      <div className="border-border bg-card text-muted-foreground rounded-xl border p-4 text-sm">
        Unable to load Strava activities.
      </div>
    );
  }

  const latestRuns = selectLatestRuns(activities.runActivities);

  return (
    <div className="bg-muted space-y-1.5 rounded-xl p-1.5">
      <Heatmap heatmap={activities.heatmap} />
      <RecentRuns runs={latestRuns} />
    </div>
  );
}

export default function Home() {
  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <div>
          <h1 className="text-xl leading-snug font-semibold tracking-tight md:text-3xl">
            Matt Bolaños
          </h1>
          <div className="bg-primary/40 mt-3 h-px w-10" />
        </div>
        <p>
          I&apos;m a developer based in New York City. I work as a full stack
          developer and data analyst for the Basketball Analytics and Innovation
          team at the{" "}
          <Link
            className="text-link"
            href="https://www.nba.com/warriors"
            rel="noopener noreferrer"
            target="_blank"
          >
            Golden State Warriors
          </Link>
          .
        </p>
        <p>
          I spend my downtime trail running, gluten-free baking and{" "}
          <Link
            className="text-link"
            href="https://letterboxd.com/mattbolanos"
            rel="noopener noreferrer"
            target="_blank"
          >
            watching movies
          </Link>
          .
        </p>
      </div>

      <Experience />

      <div className="space-y-3">
        <h2>Recent Runs</h2>
        <Suspense fallback={<ActivitiesWrapperSkeleton />}>
          <ActivitiesPreviewWrapper />
        </Suspense>
      </div>

      <div className="space-y-3">
        <h2>Recent Tracks</h2>
        <Suspense fallback={<TrackCardSkeleton />}>
          <RecentTrackWrapper />
        </Suspense>
      </div>

      <ContactLinks />
    </div>
  );
}
