import type { Route } from "next";
import Image from "next/image";
import { ViewTransition } from "react";
import { DirectionalLink } from "@/components/directional-link";
import { ProjectTag } from "@/components/project-tag";
import {
  getProjectImageTransitionName,
  getProjectTitleTransitionName,
} from "@/lib/project-view-transitions";
import type { Project } from "@/lib/projects";
import { projects } from "@/lib/projects";

export const Projects = () => {
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
      <ViewTransition
        default="none"
        name={getProjectImageTransitionName(project.slug)}
        share={{ default: "morph", "nav-forward": "project-image-grow" }}
      >
        <Image
          alt={project.name}
          className="image-card"
          height={52}
          src={`/projects/${project.imageUrl}`}
          width={52}
        />
      </ViewTransition>
      <div className="flex flex-1 flex-col items-start gap-y-1">
        <h3 className="text-sm leading-none font-normal sm:text-base">
          <DirectionalLink
            className="text-link"
            direction="nav-forward"
            href={`/projects/${project.slug}` as Route}
            prefetch
          >
            <ViewTransition
              default="none"
              name={getProjectTitleTransitionName(project.slug)}
              share="text-morph"
            >
              <span>{project.name}</span>
            </ViewTransition>
          </DirectionalLink>
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
