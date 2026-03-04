import type { Metadata } from "next";
import { Suspense } from "react";
import { ContactLinks } from "@/components/contact-links";
import { Experience } from "@/components/experience";
import { Heatmap } from "@/components/heatmap";
import { Intro } from "@/components/intro";
import { Projects } from "@/components/projects";
import { RecentRuns } from "@/components/recent-runs";
import { ActivitiesWrapperSkeleton } from "@/components/skeletons/activities-wrapper-skeleton";
import { HeatmapSkeleton } from "@/components/skeletons/heatmap-skeleton";
import { getGithubContributions } from "@/lib/api/github";
import { getActivities } from "@/lib/api/strava";
import { toGithubHeatmapEntries } from "@/lib/heatmap/github";
import { toStravaHeatmapEntries } from "@/lib/heatmap/strava";

export const metadata: Metadata = {
  description: "Matt Bolaños' personal website",
  title: "Matt Bolaños",
};

async function ActivitiesPreviewWrapper() {
  const activities = await getActivities({
    maxPages: 6,
    perPage: 100,
  });

  if (!activities) {
    return (
      <article className="bg-card rounded-lg p-4">
        Unable to load Strava activities.
      </article>
    );
  }

  const latestRuns = activities.runActivities
    .sort(
      (runA, runB) =>
        new Date(runB.start_date_local).getTime() -
        new Date(runA.start_date_local).getTime(),
    )
    .slice(0, 4);

  return (
    <>
      <Heatmap
        configId="strava"
        data={toStravaHeatmapEntries(activities.heatmap)}
      />
      <RecentRuns runs={latestRuns} />
    </>
  );
}

async function GithubContributions() {
  const githubContributions = await getGithubContributions();

  if (!githubContributions) {
    return (
      <article className="bg-card rounded-lg p-4">
        Unable to load Github contributions.
      </article>
    );
  }

  return (
    <Heatmap
      configId="github"
      data={toGithubHeatmapEntries(githubContributions)}
    />
  );
}

export default function Home() {
  return (
    <div className="space-y-10">
      <Intro />
      <Experience />
      <Projects />

      <section className="space-y-3">
        <h2>Running</h2>
        <div className="heatmap-container">
          <Suspense fallback={<ActivitiesWrapperSkeleton />}>
            <ActivitiesPreviewWrapper />
          </Suspense>
        </div>
      </section>
      <section className="space-y-3">
        <h2>Coding</h2>
        <div className="heatmap-container">
          <Suspense fallback={<HeatmapSkeleton />}>
            <GithubContributions />
          </Suspense>
        </div>
      </section>
      <ContactLinks />
    </div>
  );
}
