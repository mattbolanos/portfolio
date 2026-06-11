import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ItemLink } from "@/app/item-link";
import { FileTextIcon } from "@/components/ui/file-text";
import { GithubIcon } from "@/components/ui/github";
import { LinkIcon } from "@/components/ui/link";
import type { Project } from "@/lib/projects";

const linkIcon = {
  project: LinkIcon,
  source: GithubIcon,
  supplemental: FileTextIcon,
};

export function ProjectContent({ project }: { project: Project }) {
  const projectLinks = [
    ...(project.projectUrl
      ? [
          {
            href: project.projectUrl,
            icon: linkIcon.project,
            label: "Project",
          },
        ]
      : []),
    ...(project.githubUrl
      ? [
          {
            href: project.githubUrl,
            icon: linkIcon.source,
            label: "Source",
          },
        ]
      : []),
    ...project.supplementalLinks.map((link) => ({
      href: link.href,
      icon: linkIcon.supplemental,
      label: link.label,
    })),
  ];

  return (
    <section className="space-y-6 leading-relaxed">
      <div className="project-markdown">
        <ReactMarkdown
          components={{
            a: ({ children, ...props }) => (
              <a
                className="text-link"
                {...props}
                rel="noopener noreferrer"
                target="_blank"
              >
                {children}
              </a>
            ),
          }}
          remarkPlugins={[remarkGfm]}
        >
          {project.content}
        </ReactMarkdown>
      </div>

      {projectLinks.length > 0 ? (
        <ul className="flex flex-wrap items-center gap-1.5">
          {projectLinks.map((link) => (
            <li key={link.href}>
              <ItemLink href={link.href} Icon={link.icon} label={link.label} />
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
