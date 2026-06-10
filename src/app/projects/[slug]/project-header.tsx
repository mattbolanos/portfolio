import { Suspense } from "react";
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
      <div className="space-y-1.5">
        <h3 className="text-lg leading-none font-medium sm:text-xl">
          {project.name}
        </h3>

        {project.githubUrl ? (
          <Suspense fallback={<Skeleton className="h-4 w-32" />}>
            <RepoLastUpdated githubUrl={project.githubUrl} />
          </Suspense>
        ) : null}

        {project.description ? (
          <p className="text-sm sm:text-base">{project.description}</p>
        ) : null}
      </div>

      {project.tags.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1.5">
          {project.tags.map((tag) => (
            <ProjectTag key={tag} tag={tag} />
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
