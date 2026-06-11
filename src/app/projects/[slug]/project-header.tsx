import Image from "next/image";
import { Suspense, ViewTransition } from "react";
import {
  PROJECT_TRANSITION_SHARE,
  projectTransitionName,
} from "@/app/project-transitions";
import { ProjectTag } from "@/components/project-tag";
import { Skeleton } from "@/components/ui/skeleton";
import { getRepoPushedAt } from "@/lib/api/github";
import type { Project } from "@/lib/projects";

const REPO_UPDATED_FORMATTER = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function ProjectHeader({ project }: { project: Project }) {
  return (
    <section className="space-y-3">
      <h1 className="sr-only">{project.name}</h1>
      <div className="flex items-start gap-3">
        <ViewTransition
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
        </ViewTransition>

        <div className="space-y-1.5">
          <ViewTransition
            default="none"
            name={projectTransitionName(project.slug, "title")}
            share={PROJECT_TRANSITION_SHARE.text}
          >
            <h3 className="text-lg leading-none font-medium sm:text-xl">
              {project.name}
            </h3>
          </ViewTransition>

          {project.githubUrl ? (
            <Suspense
              fallback={
                <ViewTransition exit="fade-out">
                  <Skeleton className="h-4 w-32" />
                </ViewTransition>
              }
            >
              <ViewTransition default="none" enter="fade-in">
                <RepoLastUpdated githubUrl={project.githubUrl} />
              </ViewTransition>
            </Suspense>
          ) : null}

          {project.description ? (
            <ViewTransition
              default="none"
              name={projectTransitionName(project.slug, "description")}
              share={PROJECT_TRANSITION_SHARE.text}
            >
              <p className="text-sm sm:text-base">{project.description}</p>
            </ViewTransition>
          ) : null}
        </div>
      </div>

      {project.tags.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1.5">
          {project.tags.map((tag) => (
            <ProjectTag
              key={tag}
              tag={tag}
              transitionName={projectTransitionName(project.slug, "tag", tag)}
              transitionShare={PROJECT_TRANSITION_SHARE.tag}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}

async function RepoLastUpdated({ githubUrl }: { githubUrl: string }) {
  const pushedAt = await getRepoPushedAt(githubUrl);

  if (!pushedAt) {
    return null;
  }

  return (
    <p className="text-muted-foreground text-xs">
      Updated {REPO_UPDATED_FORMATTER.format(new Date(pushedAt))}
    </p>
  );
}
