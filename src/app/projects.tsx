import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import Image from "next/image";
import { Link } from "next-view-transitions";
import { cache } from "react";
import { ProjectTag } from "@/components/project-tag";

interface SupplementalLink {
  href: string;
  label: string;
}

interface Project {
  content: string;
  description?: string;
  githubUrl?: string;
  imageUrl: string;
  name: string;
  order: number;
  projectUrl?: string;
  slug: string;
  supplementalLinks: SupplementalLink[];
  tags: string[];
}

const projectsDirectory = path.join(process.cwd(), "src/app/projects/content");

const getProjects = cache(async (): Promise<Project[]> => {
  const entries = await readdir(projectsDirectory, { withFileTypes: true });
  const markdownFiles = entries.filter(
    (entry) => entry.isFile() && entry.name.endsWith(".md"),
  );

  const projects = await Promise.all(
    markdownFiles.map(async (file) => {
      const slug = file.name.replace(/\.md$/, "");
      const source = await readFile(
        path.join(projectsDirectory, file.name),
        "utf8",
      );
      const { content, data } = matter(source);

      return {
        content: content.trim(),
        description: optionalString(data.description),
        githubUrl: optionalString(data.githubUrl),
        imageUrl: optionalString(data.imageUrl) ?? "",
        name: optionalString(data.name) ?? titleFromSlug(slug),
        order: optionalNumber(data.order) ?? Number.MAX_SAFE_INTEGER,
        projectUrl: optionalString(data.projectUrl),
        slug: optionalString(data.slug) ?? slug,
        supplementalLinks: supplementalLinks(data.supplementalLinks),
        tags: stringArray(data.tags),
      };
    }),
  );

  return projects.sort(
    (a, b) => a.order - b.order || a.name.localeCompare(b.name),
  );
});

export async function Projects() {
  const projects = await getProjects();

  if (projects.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      <h2>Projects</h2>
      <ul className="space-y-3">
        {projects.map((project) => (
          <li
            className="flex scroll-mt-8 gap-x-3 py-3 first:pt-0 last:pb-0 md:scroll-mt-12"
            id={`project-${project.slug}`}
            key={project.slug}
          >
            <Image
              alt={project.name}
              className="image-card"
              height={52}
              priority
              src={`/projects/${project.imageUrl}`}
              width={52}
            />
            <div className="flex flex-1 flex-col items-start gap-y-1">
              <h3 className="text-sm leading-none font-normal sm:text-base">
                <Link
                  className="text-link"
                  href={`/projects/${project.slug}`}
                  prefetch
                >
                  {project.name}
                </Link>
              </h3>
              <p className="pt-1 text-xs sm:text-sm">{project.description}</p>
              <div className="flex flex-wrap items-center gap-1">
                {project.tags.map((tag) => (
                  <ProjectTag key={tag} size="sm" tag={tag} />
                ))}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function optionalNumber(value: unknown) {
  return typeof value === "number" ? value : undefined;
}

function optionalString(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function stringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function supplementalLinks(value: unknown): SupplementalLink[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (link): link is SupplementalLink =>
      typeof link === "object" &&
      link !== null &&
      "href" in link &&
      "label" in link &&
      typeof link.href === "string" &&
      typeof link.label === "string",
  );
}

function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
