import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Heatmap } from "@/components/heatmap";
import { HeatmapSkeleton } from "@/components/heatmap/skeleton";
import { ResponsiveViewTransition } from "@/components/responsive-view-transition";
import { getGithubRepoContributions } from "@/lib/api/github";
import { getProjects } from "@/lib/projects";
import { ProjectPageTransition } from "../../project-transitions";
import { ProjectContent } from "./project-content";
import { ProjectHeader } from "./project-header";
import { ProjectMedia } from "./project-media";

const WEEKS_TO_SHOW = 36;

export async function generateMetadata({
  params,
}: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const [{ slug }, projects] = await Promise.all([params, getProjects()]);
  const project = projects.find((p) => p.slug === slug);
  if (!project) return {};

  return {
    description: project.description,
    title: `${project.name} | Matt Bolaños`,
  };
}

export default async function ProjectPage({
  params,
}: PageProps<"/projects/[slug]">) {
  const [{ slug }, projects] = await Promise.all([params, getProjects()]);
  const project = projects.find((p) => p.slug === slug);

  if (!project) {
    return notFound();
  }

  return (
    <ProjectPageTransition>
      <div className="space-y-10">
        <ProjectHeader project={project} />
        <ProjectContent project={project} />
        <ProjectMedia project={project} />
        {project.githubUrl ? (
          <section className="space-y-3">
            <h2>Contributions</h2>
            <div className="heatmap-container">
              <Suspense
                fallback={
                  <ResponsiveViewTransition exit="slide-down">
                    <HeatmapSkeleton weeksToShow={WEEKS_TO_SHOW} />
                  </ResponsiveViewTransition>
                }
              >
                <ResponsiveViewTransition default="none" enter="slide-up">
                  <GithubContributions githubUrl={project.githubUrl} />
                </ResponsiveViewTransition>
              </Suspense>
            </div>
          </section>
        ) : null}
      </div>
    </ProjectPageTransition>
  );
}

export async function generateStaticParams() {
  const projects = await getProjects();

  return projects.map((project) => ({ slug: project.slug }));
}

async function GithubContributions({ githubUrl }: { githubUrl: string }) {
  const contributions = await getGithubRepoContributions(githubUrl);

  return (
    <Heatmap
      configId="github"
      data={contributions}
      summaryRangeLabel={`past ${Math.round(WEEKS_TO_SHOW / 4)} months`}
      weeksToShow={WEEKS_TO_SHOW}
    />
  );
}
