import { cacheLife } from "next/cache";
import type { ReactNode, ViewTransitionProps } from "react";
import { ResponsiveViewTransitionClient } from "./responsive-view-transition-client";

export async function ResponsiveViewTransition({
  children,
  ...props
}: ViewTransitionProps & { children: ReactNode }) {
  "use cache";
  cacheLife("max");

  return (
    <ResponsiveViewTransitionClient {...props}>
      {children}
    </ResponsiveViewTransitionClient>
  );
}
