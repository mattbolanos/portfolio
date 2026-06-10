import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";
import { projectTransitionName } from "@/app/project-transitions";
import { ProjectTag } from "@/components/project-tag";
import { getProjects } from "@/lib/projects";

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
            <ViewTransition
              default="none"
              name={projectTransitionName(project.slug, "image")}
              share="morph"
            >
              <Image
                alt={project.name}
                className="image-card shrink-0"
                height={52}
                priority
                src={`/projects/${project.imageUrl}`}
                width={52}
              />
            </ViewTransition>
            <div className="flex flex-1 flex-col items-start gap-y-1">
              <ViewTransition
                default="none"
                name={projectTransitionName(project.slug, "title")}
                share="text-morph"
              >
                <h3 className="text-sm leading-none font-normal sm:text-base">
                  <Link
                    className="text-link"
                    href={`/projects/${project.slug}` as Route}
                    prefetch
                    transitionTypes={["nav-forward"]}
                  >
                    {project.name}
                  </Link>
                </h3>
              </ViewTransition>
              <ViewTransition
                default="none"
                name={projectTransitionName(project.slug, "description")}
                share="text-morph"
              >
                <p className="pt-1 text-xs sm:text-sm">{project.description}</p>
              </ViewTransition>
              <div className="flex flex-wrap items-center gap-1">
                {project.tags.map((tag) => (
                  <ProjectTag
                    key={tag}
                    size="sm"
                    tag={tag}
                    transitionName={projectTransitionName(
                      project.slug,
                      "tag",
                      tag,
                    )}
                  />
                ))}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
