import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
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
    title: `${project.name} — Matt Bolaños`,
  };
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
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center gap-x-3">
          <Image
            alt={project.name}
            className="size-12 rounded-lg sm:size-14"
            height={56}
            src={`/projects/${project.imageUrl}`}
            width={56}
          />
          <div>
            <h1 className="text-xl font-medium sm:text-2xl">{project.name}</h1>
            <p className="text-muted-foreground text-sm">
              {project.description}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {project.tags.map((tag) => (
            <div
              className="border-border bg-card flex items-center justify-center gap-x-1 rounded-full border px-2 py-0.5"
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
      </div>

      <div className="text-muted-foreground space-y-4 text-sm leading-relaxed">
        {project.longDescription.split("\n\n").map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-medium">Screenshots</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {project.screenshots.map((src, i) => (
            <div
              className="border-border bg-muted flex aspect-video items-center justify-center rounded-lg border"
              key={i}
            >
              <span className="text-muted-foreground text-xs">
                Screenshot {i + 1}
              </span>
            </div>
          ))}
        </div>
      </div>

      <a
        className="border-border bg-card hover:bg-muted inline-flex items-center gap-x-2 rounded-lg border px-4 py-2 text-sm transition-colors"
        href={project.url}
        rel="noopener noreferrer"
        target="_blank"
      >
        View on GitHub &rarr;
      </a>
    </div>
  );
}
