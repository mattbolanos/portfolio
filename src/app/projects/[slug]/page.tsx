import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Heatmap } from "@/components/heatmap";
import { HeatmapSkeleton } from "@/components/heatmap/heatmap-skeleton";
import { LinkItem } from "@/components/link-item";
import { ProjectTag } from "@/components/project-tag";
import { FileStackIcon } from "@/components/ui/file-stack";
import { GithubIcon } from "@/components/ui/github";
import { LinkIcon } from "@/components/ui/link";
import { Skeleton } from "@/components/ui/skeleton";
import { getGithubRepoContributions, getRepoPushedAt } from "@/lib/api/github";
import { toGithubHeatmapEntries } from "@/lib/heatmap/github";
import { getProjectBySlug, getProjects } from "@/lib/projects";
import {
  getProjectDescriptionViewTransitionName,
  getProjectTagViewTransitionName,
  getProjectTitleViewTransitionName,
} from "@/lib/view-transitions";

const WEEKS_TO_SHOW = 36;
const PROJECT_DATA_REVALIDATE_SECONDS = 24 * 60 * 60;

const getCachedGithubRepoContributions = unstable_cache(
  getGithubRepoContributions,
  ["project-github-contributions"],
  {
    revalidate: PROJECT_DATA_REVALIDATE_SECONDS,
  },
);

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
    <p className="text-muted-foreground text-xs" suppressHydrationWarning>
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
  const githubContributions = await getCachedGithubRepoContributions(githubUrl);

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
      summaryRangeLabel={`past ${Math.round(WEEKS_TO_SHOW / 4)} months`}
      weeksToShow={WEEKS_TO_SHOW}
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
      <div className="space-y-10">
        <section className="space-y-3">
          <h1 className="sr-only">{project.name}</h1>
          <div className="space-y-1.5">
            <h3
              className="text-lg leading-none font-medium sm:text-xl"
              style={{
                viewTransitionName: getProjectTitleViewTransitionName(
                  project.slug,
                ),
              }}
            >
              {project.name}
            </h3>

            {project.githubUrl && (
              <Suspense fallback={<Skeleton className="h-4 w-32" />}>
                <RepoLastUpdated githubUrl={project.githubUrl} />
              </Suspense>
            )}

            <p
              className="animate-project-description text-sm sm:text-base"
              style={{
                viewTransitionName: getProjectDescriptionViewTransitionName(
                  project.slug,
                ),
              }}
            >
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
        </section>

        <section className="space-y-6 leading-relaxed">
          <div className="project-markdown space-y-6">
            <ReactMarkdown
              components={{
                a: ({ children, ...props }) => (
                  <a className="text-link" {...props} target="_blank">
                    {children}
                  </a>
                ),
              }}
              remarkPlugins={[remarkGfm]}
            >
              {project.content}
            </ReactMarkdown>
          </div>
          {projectLinks.length > 0 && (
            <ul className="flex flex-wrap items-center gap-1.5">
              {projectLinks.map((link) => (
                <li className="cursor-pointer" key={link.href}>
                  <LinkItem
                    href={link.href}
                    Icon={link.Icon}
                    label={link.label}
                  />
                </li>
              ))}
            </ul>
          )}
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
                        loading="eager"
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
              <Suspense
                fallback={<HeatmapSkeleton weeksToShow={WEEKS_TO_SHOW} />}
              >
                <GithubContributions githubUrl={project.githubUrl} />
              </Suspense>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
