import type { Metadata } from "next";
import { Suspense } from "react";
import { ContactLinks } from "@/components/contact-links";
import { Experience } from "@/components/experience";
import { Header } from "@/components/header";
import { Heatmap } from "@/components/heatmap";
import { HeatmapSkeleton } from "@/components/heatmap/heatmap-skeleton";
import { Intro } from "@/components/intro";
import { Projects } from "@/components/projects";
import { ActivitiesPreviewSkeleton } from "@/components/strava/activities-preview-skeleton";
import { RecentRuns } from "@/components/strava/recent-runs";
import { getGithubContributions } from "@/lib/api/github";
import { getActivities } from "@/lib/api/strava";
import { toGithubHeatmapEntries } from "@/lib/heatmap/github";
import { toStravaHeatmapEntries } from "@/lib/heatmap/strava";

export const metadata: Metadata = {
  description: "Matt Bolaños' personal website",
  title: "Matt Bolaños",
};

async function ActivitiesPreviewWrapper() {
  const activities = await getActivities();

  if (!activities) {
    return (
      <article className="bg-card rounded-lg p-3 sm:p-4">
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
      <article className="bg-card rounded-lg p-3 sm:p-4">
        <p className="text-muted-foreground text-sm sm:text-base">
          Unable to load Github contributions.
        </p>
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
    <div>
      <Header />
      <div className="space-y-10">
        <Intro />
        <Experience />
        <Projects />
        <section className="space-y-3">
          <h2>Coding</h2>
          <div className="heatmap-container">
            <Suspense fallback={<HeatmapSkeleton />}>
              <GithubContributions />
            </Suspense>
          </div>
        </section>
        <section className="space-y-3">
          <h2>Running</h2>
          <div className="heatmap-container">
            <Suspense fallback={<ActivitiesPreviewSkeleton />}>
              <ActivitiesPreviewWrapper />
            </Suspense>
          </div>
        </section>
        <ContactLinks />
      </div>
    </div>
  );
}
