import { ViewTransition } from "react";

export function ProjectPageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ViewTransition
      default="none"
      enter={{
        default: "none",
        "nav-back": "nav-back",
        "nav-forward": "nav-forward",
      }}
      exit={{
        default: "none",
        "nav-back": "nav-back",
        "nav-forward": "nav-forward",
      }}
    >
      {children}
    </ViewTransition>
  );
}

export function projectTransitionName(
  slug: string,
  part: "description" | "image" | "tag" | "title",
  tag?: string,
) {
  return tag ? `project-${slug}-${part}-${tag}` : `project-${slug}-${part}`;
}
