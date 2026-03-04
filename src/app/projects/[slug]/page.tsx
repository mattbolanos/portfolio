import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Heatmap } from "@/components/heatmap";
import { LinkItem } from "@/components/link-item";
import { HeatmapSkeleton } from "@/components/skeletons/heatmap-skeleton";
import { GithubIcon } from "@/components/ui/github";
import { Skeleton } from "@/components/ui/skeleton";
import { getGithubRepoContributions, getRepoPushedAt } from "@/lib/api/github";
import { toGithubHeatmapEntries } from "@/lib/heatmap/github";
import { formatTagLabel, projects } from "@/lib/projects";

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
      <article className="bg-card rounded-lg p-4">
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

  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <div className="flex items-center gap-x-3">
          <Image
            alt={project.name}
            className="size-12 sm:size-13"
            height={52}
            src={`/projects/${project.imageUrl}`}
            width={52}
          />
          <div>
            <h1 className="text-lg font-medium sm:text-xl">{project.name}</h1>
            <p className="text-xs sm:text-sm">{project.description}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {project.tags.map((tag) => (
            <div
              className="border-border bg-card flex items-center justify-center gap-x-1 rounded-full border px-3 py-1.5"
              key={tag}
              title={formatTagLabel(tag)}
            >
              <Image
                alt={formatTagLabel(tag)}
                className="size-3.5 sm:size-4"
                height={16}
                src={`/stack/${tag}.svg`}
                width={16}
              />
              <span className="text-xs">{formatTagLabel(tag)}</span>
            </div>
          ))}
        </div>

        <Suspense fallback={<Skeleton className="h-4 w-32" />}>
          <RepoLastUpdated githubUrl={project.githubUrl} />
        </Suspense>
      </section>

      <section className="space-y-6 leading-relaxed">
        {project.longDescription.map((paragraph, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: <paragraph order won't change / re-render>
          <p key={i}>{paragraph}</p>
        ))}

        <LinkItem
          className="w-fit"
          href={project.githubUrl}
          Icon={GithubIcon}
          label="View on GitHub"
        />
      </section>

      <section className="space-y-3">
        <h2>Images</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-6">
          {project.images.map((image) => (
            <div
              className="group border-border bg-muted/50 relative overflow-hidden rounded-xl border shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md motion-reduce:transition-none"
              key={image.src}
            >
              <Image
                alt={`${project.name} image`}
                className="w-full transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
                height={image.height ?? image.width}
                sizes="(min-width: 640px) 50vw, 100vw"
                src={image.src}
                width={image.width}
              />
              <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-black/5 ring-inset dark:ring-white/8" />
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2>Contributions</h2>
        <div className="heatmap-container">
          <Suspense fallback={<HeatmapSkeleton />}>
            <GithubContributions githubUrl={project.githubUrl} />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
