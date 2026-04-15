import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { ProjectTag } from "@/components/project-tag";
import { getProjects, type Project } from "@/lib/projects";

export const Projects = async () => {
  const projects = await getProjects();

  return (
    <div className="space-y-3">
      <h2>Projects</h2>
      <ul className="flex flex-col gap-y-4">
        {projects.map((project) => (
          <ProjectItem key={project.name} project={project} />
        ))}
      </ul>
    </div>
  );
};

function ProjectItem({ project }: { project: Project }) {
  return (
    <li
      className="flex scroll-mt-8 gap-x-3 py-3 first:pt-0 last:pb-0 md:scroll-mt-12"
      id={`project-${project.slug}`}
    >
      <Image
        alt={project.name}
        className="image-card"
        height={52}
        src={`/projects/${project.imageUrl}`}
        width={52}
      />
      <div className="flex flex-1 flex-col items-start gap-y-1">
        <h3 className="text-sm leading-none font-normal sm:text-base">
          <Link
            className="text-link"
            href={`/projects/${project.slug}` as Route}
            prefetch
          >
            <span>{project.name}</span>
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
  );
}
