import type { ReactNode } from "react";
import { ResponsiveViewTransition } from "@/components/responsive-view-transition";

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
