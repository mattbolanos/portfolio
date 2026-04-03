import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense, ViewTransition } from "react";
import { DirectionalPageTransition } from "@/components/directional-page-transition";
import { Heatmap } from "@/components/heatmap";
import { HeatmapSkeleton } from "@/components/heatmap/heatmap-skeleton";
import { LinkItem } from "@/components/link-item";
import { ProjectTag } from "@/components/project-tag";
import { GithubIcon } from "@/components/ui/github";
import { LinkIcon } from "@/components/ui/link";
import { Skeleton } from "@/components/ui/skeleton";
import { getGithubRepoContributions, getRepoPushedAt } from "@/lib/api/github";
import { toGithubHeatmapEntries } from "@/lib/heatmap/github";
import {
  getProjectDescriptionTransitionName,
  getProjectImageTransitionName,
  getProjectTitleTransitionName,
} from "@/lib/project-view-transitions";
import { projects } from "@/lib/projects";

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return {};
  return {
    description: project.description,
    title: `${project.name} | Matt Bolaños`,
  };
}

async function RepoLastUpdated({ githubUrl }: { githubUrl: string }) {
  const pushedAt = await getRepoPushedAt(githubUrl);
  if (!pushedAt) return null;

  return (
    <p className="text-muted-foreground text-xs">
      Updated{" "}
      {new Date(pushedAt).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })}
    </p>
  );
}

async function GithubContributions({ githubUrl }: { githubUrl: string }) {
  const githubContributions = await getGithubRepoContributions(githubUrl);

  if (!githubContributions) {
    return (
      <article className="bg-card rounded-lg p-3 sm:p-4">
        Unable to load GitHub contributions.
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

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();

  const projectLinks = [
    project.projectUrl
      ? {
          href: project.projectUrl,
          Icon: LinkIcon,
          label: "Visit Project",
        }
      : null,
    project.githubUrl
      ? {
          href: project.githubUrl,
          Icon: GithubIcon,
          label: "View on GitHub",
        }
      : null,
  ].filter((link) => link !== null);

  const landscapeImages =
    project.images?.filter((img) => {
      const h = img.height ?? img.width;
      return img.width >= h;
    }) ?? [];
  const portraitImages =
    project.images?.filter((img) => {
      const h = img.height ?? img.width;
      return h > img.width;
    }) ?? [];

  return (
    <DirectionalPageTransition>
      <div className="space-y-10">
        <section className="space-y-3">
          <div className="flex items-center gap-x-3">
            <ViewTransition
              default="none"
              name={getProjectImageTransitionName(project.slug)}
              share={{ default: "morph", "nav-forward": "project-image-grow" }}
            >
              <Image
                alt={project.name}
                className="size-16 sm:size-20"
                height={80}
                src={`/projects/${project.imageUrl}`}
                width={80}
              />
            </ViewTransition>
            <div>
              <h1 className="text-lg font-medium sm:text-xl">
                <ViewTransition
                  default="none"
                  name={getProjectTitleTransitionName(project.slug)}
                  share="text-morph"
                >
                  <span>{project.name}</span>
                </ViewTransition>
              </h1>
              <ViewTransition
                default="none"
                name={getProjectDescriptionTransitionName(project.slug)}
                share="text-morph"
              >
                <p className="text-xs sm:text-sm">{project.description}</p>
              </ViewTransition>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {project.tags.map((tag) => (
              <ProjectTag key={tag} tag={tag} />
            ))}
          </div>

          {project.githubUrl && (
            <Suspense fallback={<Skeleton className="h-4 w-32" />}>
              <RepoLastUpdated githubUrl={project.githubUrl} />
            </Suspense>
          )}
        </section>

        <section className="space-y-6 leading-relaxed">
          {projectLinks.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {projectLinks.map((link) => (
                <LinkItem
                  className="w-fit"
                  href={link.href}
                  Icon={link.Icon}
                  key={link.href}
                  label={link.label}
                />
              ))}
            </div>
          )}
          {project.longDescription.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </section>

        {project.images && (
          <section className="space-y-3">
            <h2>Media</h2>
            {landscapeImages.length > 0 && (
              <div className="space-y-3">
                {landscapeImages.map((image) => {
                  const imageHeight = image.height ?? image.width;
                  return (
                    <div
                      className="overflow-hidden rounded-xl ring-1 ring-black/5 dark:ring-white/10"
                      key={image.src}
                    >
                      <Image
                        alt={`${project.name} screenshot`}
                        className="h-auto w-full"
                        height={imageHeight}
                        src={image.src}
                        width={image.width}
                      />
                    </div>
                  );
                })}
              </div>
            )}
            {portraitImages.length > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {portraitImages.map((image) => {
                  const imageHeight = image.height ?? image.width;
                  return (
                    <div
                      className="overflow-hidden rounded-xl ring-1 ring-black/5 dark:ring-white/10"
                      key={image.src}
                    >
                      <Image
                        alt={`${project.name} screenshot`}
                        className="h-auto w-full"
                        height={imageHeight}
                        src={image.src}
                        width={image.width}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}
        {project.githubUrl && (
          <section className="space-y-3">
            <h2>Contributions</h2>
            <div className="heatmap-container">
              <Suspense fallback={<HeatmapSkeleton />}>
                <GithubContributions githubUrl={project.githubUrl} />
              </Suspense>
            </div>
          </section>
        )}
      </div>
    </DirectionalPageTransition>
  );
}
