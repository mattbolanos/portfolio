import Image from "next/image";

interface Project {
  name: string;
  description: string;
  tags: string[];
  url: string;
  imageUrl: string;
}

function formatTagLabel(tag: string): string {
  return tag.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

const projects: Project[] = [
  {
    description:
      "iOS widget that displays a GitHub-style heatmap of your Strava activities.",
    imageUrl: "stratiles.png",
    name: "Stratiles",
    tags: ["swift", "cloudflare-workers"],
    url: "https://github.com/mattbolanos/stratiles",
  },
];

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
    <li className="flex gap-x-3 py-4 first:pt-0 last:pb-0">
      <div className="flex-none pt-0.5">
        <Image
          alt={project.name}
          className="size-10 rounded-lg sm:size-12"
          height={48}
          src={`/projects/${project.imageUrl}`}
          width={48}
        />
      </div>
      <div className="flex flex-1 flex-col items-start gap-y-1">
        <h3 className="text-sm leading-none font-normal sm:text-base">
          {project.name}
        </h3>
        <p className="text-sm">{project.description}</p>
        <div className="flex flex-wrap items-center gap-1">
          {project.tags.map((tag) => (
            <div
              className="border-border bg-card flex items-center justify-center gap-x-1 rounded-full border px-2 py-0.5"
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
      </div>
    </li>
  );
}
