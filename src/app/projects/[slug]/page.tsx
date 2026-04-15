import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Heatmap } from "@/components/heatmap";
import { HeatmapSkeleton } from "@/components/heatmap/heatmap-skeleton";
import { LinkItem } from "@/components/link-item";
import { ProjectBreadcrumb } from "@/components/project-breadcrumb";
import { ProjectTag } from "@/components/project-tag";
import { FileStackIcon } from "@/components/ui/file-stack";
import { GithubIcon } from "@/components/ui/github";
import { LinkIcon } from "@/components/ui/link";
import { Skeleton } from "@/components/ui/skeleton";
import { getGithubRepoContributions, getRepoPushedAt } from "@/lib/api/github";
import { toGithubHeatmapEntries } from "@/lib/heatmap/github";
import { getProjectBySlug, getProjects } from "@/lib/projects";
import {
  getProjectImageViewTransitionName,
  getProjectTagViewTransitionName,
} from "@/lib/view-transitions";

export async function generateStaticParams() {
  const projects = await getProjects();

  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
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
        <p className="text-muted-foreground text-sm sm:text-base">
          Unable to load GitHub contributions.
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

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const projectLinks = [
    ...(project.projectUrl
      ? [
          {
            href: project.projectUrl,
            Icon: LinkIcon,
            label: "Project",
          },
        ]
      : []),
    {
      href: project.githubUrl,
      Icon: GithubIcon,
      label: "Source",
    },
    ...(project.supplementalLinks?.map((link) => ({
      href: link.href,
      Icon: FileStackIcon,
      label: link.label,
    })) ?? []),
  ];

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
    <div>
      <ProjectBreadcrumb projectName={project.name} slug={project.slug} />

      <div className="space-y-10">
        <section className="space-y-3">
          <h1 className="sr-only">{project.name}</h1>
          <div className="flex items-center gap-x-3">
            <Image
              alt={project.name}
              className="size-16 sm:size-20"
              height={80}
              src={`/projects/${project.imageUrl}`}
              style={{
                viewTransitionName: getProjectImageViewTransitionName(
                  project.slug,
                ),
              }}
              width={80}
            />
            <p className="animate-project-description text-sm sm:text-base">
              {project.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {project.tags.map((tag) => (
              <ProjectTag
                key={tag}
                tag={tag}
                transitionName={getProjectTagViewTransitionName(
                  project.slug,
                  tag,
                )}
              />
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
            <div className="flex flex-wrap gap-1.5">
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
          <div className="project-markdown space-y-6 leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {project.content}
            </ReactMarkdown>
          </div>
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
    </div>
  );
}
