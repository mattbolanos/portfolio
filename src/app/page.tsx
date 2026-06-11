import type { Metadata } from "next";
import { Suspense } from "react";
import { Intro } from "@/app/intro";
import { Heatmap } from "@/components/heatmap";
import { HeatmapSkeleton } from "@/components/heatmap/skeleton";
import { ResponsiveViewTransition } from "@/components/responsive-view-transition";
import { RecentRuns } from "@/components/strava/recent-runs";
import { StravaSkeleton } from "@/components/strava/skeleton";
import { getGithubContributions } from "@/lib/api/github";
import { getActivities } from "@/lib/api/strava";
import { Contact } from "./contact";
import { Experience } from "./experience";
import { ProjectPageTransition } from "./project-transitions";
import { Projects } from "./projects";

export const metadata: Metadata = {
  description: "Matt Bolaños' personal website",
  title: "Matt Bolaños",
};

export default function Home() {
  return (
    <ProjectPageTransition>
      <div className="space-y-10">
        <Intro />
        <Projects />
        <Experience />
        <section className="space-y-3">
          <h2>Running</h2>
          <div className="heatmap-container">
            <Suspense
              fallback={
                <ResponsiveViewTransition exit="slide-down">
                  <StravaSkeleton />
                </ResponsiveViewTransition>
              }
            >
              <ResponsiveViewTransition default="none" enter="slide-up">
                <StravaWrapper />
              </ResponsiveViewTransition>
            </Suspense>
          </div>
        </section>
        <section className="space-y-3">
          <h2>Coding</h2>
          <div className="heatmap-container">
            <Suspense
              fallback={
                <ResponsiveViewTransition exit="slide-down">
                  <HeatmapSkeleton />
                </ResponsiveViewTransition>
              }
            >
              <ResponsiveViewTransition default="none" enter="slide-up">
                <GitHubWrapper />
              </ResponsiveViewTransition>
            </Suspense>
          </div>
        </section>

        <Contact />
      </div>
    </ProjectPageTransition>
  );
}

async function GitHubWrapper() {
  const contributions = await getGithubContributions();

  if (!contributions) {
    return (
      <article className="bg-card rounded-lg p-3 sm:p-4">
        Unable to load GitHub contributions.
      </article>
    );
  }

  return <Heatmap configId="github" data={contributions} />;
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
