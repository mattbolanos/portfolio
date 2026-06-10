import type { Metadata } from "next";
import { Suspense } from "react";
import { Intro } from "@/app/intro";
import { Heatmap } from "@/components/heatmap";
import { RecentRuns } from "@/components/strava/recent-runs";
import { StravaSkeleton } from "@/components/strava/skeleton";
import { getActivities } from "@/lib/api/strava";
import { Experience } from "./experience";
import { Projects } from "./projects";

export const metadata: Metadata = {
  description: "Matt Bolaños' personal website",
  title: "Matt Bolaños",
};

export default function Home() {
  return (
    <div className="space-y-10">
      <Intro />
      <Projects />
      <Experience />
      <section className="space-y-3">
        <h2>Running</h2>
        <div className="heatmap-container">
          <Suspense fallback={<StravaSkeleton />}>
            <StravaWrapper />
          </Suspense>
        </div>
      </section>
    </div>
  );
}

async function StravaWrapper() {
  const { heatmap, latestRuns } = await getActivities();

  if (!heatmap || !latestRuns) {
    return (
      <article className="bg-card rounded-lg p-3 sm:p-4">
        Unable to load Strava activities.
      </article>
    );
  }

  return (
    <>
      <Heatmap configId="strava" data={heatmap} />
      <RecentRuns runs={latestRuns} />
    </>
  );
}
