import type { Metadata } from "next";
import { Suspense } from "react";
import { ContactLinks } from "@/components/contact-links";
import { Experience } from "@/components/experience";
import { Heatmap } from "@/components/heatmap";
import { HeatmapSkeleton } from "@/components/heatmap/heatmap-skeleton";
import { Intro } from "@/components/intro";
import { Projects } from "@/components/projects";
import { ActivitiesPreviewSkeleton } from "@/components/strava/activities-preview-skeleton";
import { RecentRuns } from "@/components/strava/recent-runs";
import { Skeleton } from "@/components/ui/skeleton";
import { getGithubContributions } from "@/lib/api/github";
import { getActivities } from "@/lib/api/strava";
import { toGithubHeatmapEntries } from "@/lib/heatmap/github";
import { toStravaHeatmapEntries } from "@/lib/heatmap/strava";

export const metadata: Metadata = {
  description: "Matt Bolaños' personal website",
  title: "Matt Bolaños",
};

const PROJECT_SKELETON_ITEMS = ["project-1", "project-2", "project-3"];

export const revalidate = 86_400;

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

function ProjectsSkeleton() {
  return (
    <div className="space-y-3">
      <h2>Projects</h2>
      <ul className="flex flex-col gap-y-4">
        {PROJECT_SKELETON_ITEMS.map((item) => (
          <li className="flex gap-x-3 py-3 first:pt-0 last:pb-0" key={item}>
            <Skeleton className="size-13 shrink-0" />
            <div className="flex flex-1 flex-col gap-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-full max-w-md" />
              <div className="flex gap-1">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-20" />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Home() {
  return (
    <div className="space-y-10">
      <Intro />
      <Suspense fallback={<ProjectsSkeleton />}>
        <Projects />
      </Suspense>
      <Experience />
      <section className="space-y-3">
        <h2>Running</h2>
        <div className="heatmap-container">
          <Suspense fallback={<ActivitiesPreviewSkeleton />}>
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
