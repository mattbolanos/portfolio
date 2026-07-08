import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { cacheLife, cacheTag } from "next/cache";

export interface SupplementalLink {
  href: string;
  label: string;
}

export interface Project {
  content: string;
  description?: string;
  githubUrl?: string;
  imageUrl: string;
  images: ProjectImage[];
  name: string;
  order: number;
  projectUrl?: string;
  slug: string;
  supplementalLinks: SupplementalLink[];
  tags: string[];
}

export interface ProjectImage {
  height?: number;
  src: string;
  width: number;
}

const projectsDirectory = path.join(process.cwd(), "src/app/projects/content");

export async function getProjects(): Promise<Project[]> {
  "use cache";
  cacheLife("max");
  cacheTag("projects");

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
        images: projectImages(data.images),
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

function projectImages(value: unknown): ProjectImage[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (image): image is ProjectImage =>
      typeof image === "object" &&
      image !== null &&
      "src" in image &&
      "width" in image &&
      typeof image.src === "string" &&
      typeof image.width === "number" &&
      (!("height" in image) || typeof image.height === "number"),
  );
}

function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
