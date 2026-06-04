import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { cache } from "react";
import { z } from "zod";

interface ProjectImage {
  src: string;
  width: number;
  height?: number;
}

interface ProjectSupplementalLink {
  href: string;
  label: string;
}

export interface Project {
  name: string;
  slug: string;
  order: number;
  description: string;
  tags: string[];
  githubUrl: string;
  projectUrl?: string;
  supplementalLinks?: ProjectSupplementalLink[];
  imageUrl: string;
  images?: ProjectImage[];
  content: string;
}

interface TagLabelOverrides {
  tag: string;
  label: string;
}

const projectFrontmatterSchema = z.object({
  description: z.string(),
  githubUrl: z.url(),
  images: z
    .array(
      z.object({
        height: z.number().int().positive().optional(),
        src: z.string(),
        width: z.number().int().positive(),
      }),
    )
    .optional(),
  imageUrl: z.string(),
  name: z.string(),
  order: z.number().int().nonnegative(),
  projectUrl: z.url().optional(),
  slug: z.string(),
  supplementalLinks: z
    .array(
      z.object({
        href: z.url(),
        label: z.string(),
      }),
    )
    .optional(),
  tags: z.array(z.string()).min(1),
});

const PROJECTS_DIRECTORY = path.join(process.cwd(), "src/content/projects");

const PROJECT_TAG_LABEL_OVERRIDES: TagLabelOverrides[] = [
  { label: "Next.js", tag: "next.js" },
  {
    label: "TypeScript",
    tag: "typescript",
  },
];

const loadProjects = cache(async (): Promise<Project[]> => {
  const filenames = (await fs.readdir(PROJECTS_DIRECTORY))
    .filter((filename) => filename.endsWith(".md"))
    .sort();

  const projects = await Promise.all(
    filenames.map(async (filename) => {
      const source = await fs.readFile(
        path.join(PROJECTS_DIRECTORY, filename),
        "utf8",
      );
      const { content, data } = matter(source);
      const frontmatter = projectFrontmatterSchema.parse(data);

      return {
        ...frontmatter,
        content: content.trim(),
      };
    }),
  );

  return projects.sort((projectA, projectB) => projectA.order - projectB.order);
});

export async function getProjects() {
  return loadProjects();
}

export async function getProjectBySlug(slug: string) {
  const projects = await loadProjects();
  return projects.find((project) => project.slug === slug);
}

export function formatTagLabel(tag: string): string {
  const overrideLabel = PROJECT_TAG_LABEL_OVERRIDES.find(
    (labels) => labels.tag === tag,
  );

  if (overrideLabel) return overrideLabel.label;
  return tag.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
