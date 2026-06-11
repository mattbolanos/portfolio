import type { ReactNode } from "react";
import { ResponsiveViewTransition } from "@/components/responsive-view-transition";

export const PROJECT_TRANSITION_SHARE = {
  image: "project-image-morph",
  tag: "project-chip-morph",
  text: "project-text-morph",
} as const;

const PAGE_TRANSITION_CLASSES = {
  default: "none",
  "nav-back": "nav-back",
  "nav-forward": "nav-forward",
} as const;

export function ProjectPageTransition({ children }: { children: ReactNode }) {
  return (
    <ResponsiveViewTransition
      default="none"
      enter={PAGE_TRANSITION_CLASSES}
      exit={PAGE_TRANSITION_CLASSES}
    >
      {children}
    </ResponsiveViewTransition>
  );
}

export function projectTransitionName(
  slug: string,
  part: "description" | "image" | "tag" | "title",
  tag?: string,
) {
  return tag ? `project-${slug}-${part}-${tag}` : `project-${slug}-${part}`;
}
