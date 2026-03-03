import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { LinkItem } from "@/components/link-item";
import { GithubIcon } from "@/components/ui/github";
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
    <div className="space-y-9">
      <section className="space-y-3">
        <div className="flex items-center gap-x-3">
          <Image
            alt={project.name}
            className="size-12 rounded-lg sm:size-14"
            height={56}
            src={`/projects/${project.imageUrl}`}
            width={56}
          />
          <div>
            <h1 className="font-medium sm:text-lg">{project.name}</h1>
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
      </section>

      <section className="space-y-6 text-sm leading-relaxed">
        <div className="space-y-3">
          {project.longDescription.map((paragraph, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: <paragraph order won't change / re-render>
            <p key={i}>{paragraph}</p>
          ))}
        </div>
        {project.githubUrl && (
          <LinkItem
            className="w-fit"
            href={project.githubUrl}
            Icon={GithubIcon}
            label="View on GitHub"
          />
        )}
      </section>

      <div className="space-y-3">
        <h2>Images</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-6">
          {project.imgs.map((src) => (
            <div
              className="group border-border bg-muted/50 relative overflow-hidden rounded-xl border shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md motion-reduce:transition-none"
              key={src}
            >
              <Image
                alt={`${project.name} screenshot`}
                className="w-full transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
                height={720}
                src={src}
                width={1280}
              />
              <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-black/5 ring-inset dark:ring-white/8" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
