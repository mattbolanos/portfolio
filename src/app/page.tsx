import Link from "next/link";
import { Suspense } from "react";
import { ContactLinks } from "@/components/contact-links";
import { Experience } from "@/components/experience";
import { Heatmap } from "@/components/heatmap";
import { RecentRuns } from "@/components/recent-runs";
import { TrackCard, TrackCardSkeleton } from "@/components/track-card";
import { getLatestTrack } from "@/lib/api/last-fm";
import { type GetActivitiesResult, getActivities } from "@/lib/api/strava";

type RecentRun = GetActivitiesResult["runActivities"][number];

const selectLatestRuns = (runs: RecentRun[], limit = 2): RecentRun[] =>
  [...runs]
    .sort(
      (runA, runB) =>
        new Date(runB.start_date_local).getTime() -
        new Date(runA.start_date_local).getTime(),
    )
    .slice(0, limit);

async function RecentTrackWrapper() {
  const latestTrack = await getLatestTrack();

  if (!latestTrack) {
    return null;
  }

  return <TrackCard latestTrack={latestTrack} />;
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
    <div className="space-y-6">
      <h1 className="text-xl leading-14 font-medium md:text-2xl">
        Matt Bolaños
      </h1>
      <p>
        I'm a developer based in New York City. I work as a full stack developer
        and data analyst for the Basketball Analytics and Innovation team at the{" "}
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
      {/* experience */}
      <Experience />

      {/* strava preview */}
      <Suspense
        fallback={
          <div className="border-border bg-card text-muted-foreground rounded-xl border p-4 text-sm">
            Loading Strava activities...
          </div>
        }
      >
        <ActivitiesPreviewWrapper />
      </Suspense>

      {/* recent track */}
      <Suspense fallback={<TrackCardSkeleton />}>
        <RecentTrackWrapper />
      </Suspense>

      {/* contact links */}
      <ContactLinks />
    </div>
  );
}
