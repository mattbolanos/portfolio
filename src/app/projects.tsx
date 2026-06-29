import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  PROJECT_TRANSITION_SHARE,
  projectTransitionName,
} from "@/app/project-transition-names";
import { ProjectTag } from "@/components/project-tag";
import { ResponsiveViewTransition } from "@/components/responsive-view-transition";
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
            <ResponsiveViewTransition
              default="none"
              name={projectTransitionName(project.slug, "image")}
              share={PROJECT_TRANSITION_SHARE.image}
            >
              <Image
                alt={project.name}
                className="image-card shrink-0"
                height={52}
                priority
                src={`/projects/${project.imageUrl}`}
                width={52}
              />
            </ResponsiveViewTransition>
            <div className="flex flex-1 flex-col items-start gap-y-1">
              <ResponsiveViewTransition
                default="none"
                name={projectTransitionName(project.slug, "title")}
                share={PROJECT_TRANSITION_SHARE.text}
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
              </ResponsiveViewTransition>
              <ResponsiveViewTransition
                default="none"
                name={projectTransitionName(project.slug, "description")}
                share={PROJECT_TRANSITION_SHARE.text}
              >
                <p className="pt-1 text-xs sm:text-sm">{project.description}</p>
              </ResponsiveViewTransition>
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
                    transitionShare={PROJECT_TRANSITION_SHARE.tag}
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
