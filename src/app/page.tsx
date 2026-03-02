import type { Metadata } from "next";
import { Suspense } from "react";
import { ActivitiesWrapperSkeleton } from "@/components/activities-wrapper-skeleton";
import { ContactLinks } from "@/components/contact-links";
import { Experience } from "@/components/experience";
import { Heatmap } from "@/components/heatmap";
import { Intro } from "@/components/intro";
import { Projects } from "@/components/projects";
import { RecentRuns } from "@/components/recent-runs";
import { getActivities } from "@/lib/api/strava";

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
      <div className="border-border bg-card text-muted-foreground rounded-xl border p-4 text-sm">
        Unable to load Strava activities.
      </div>
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
      <Heatmap heatmap={activities.heatmap} />
      <RecentRuns runs={latestRuns} />
    </>
  );
}

export default function Home() {
  return (
    <div className="space-y-12">
      <div className="w-fit space-y-1.5">
        <h1 className="text-xl leading-snug font-semibold tracking-tight md:text-2xl">
          Matt Bolaños
        </h1>
        <div className="bg-primary h-0.5 w-full" />
      </div>
      <Intro />

      <Experience />

      <Projects />

      <div className="space-y-3">
        <h2>Recent Runs</h2>
        <div className="bg-muted space-y-1.5 rounded-xl p-2">
          <Suspense fallback={<ActivitiesWrapperSkeleton />}>
            <ActivitiesPreviewWrapper />
          </Suspense>
        </div>
      </div>

      <ContactLinks />
    </div>
  );
}
