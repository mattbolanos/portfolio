"use client";

import {
  type ReactNode,
  useSyncExternalStore,
  ViewTransition,
  type ViewTransitionProps,
} from "react";

const MOBILE_VIEWPORT_QUERY = "(max-width: 640px)";

function subscribeToMobileViewport(onStoreChange: () => void) {
  const mediaQueryList = window.matchMedia(MOBILE_VIEWPORT_QUERY);
  mediaQueryList.addEventListener("change", onStoreChange);

  return () => {
    mediaQueryList.removeEventListener("change", onStoreChange);
  };
}

function getMobileViewportSnapshot() {
  return window.matchMedia(MOBILE_VIEWPORT_QUERY).matches;
}

function getServerMobileViewportSnapshot() {
  return false;
}

export function ResponsiveViewTransition({
  children,
  ...props
}: ViewTransitionProps & { children: ReactNode }) {
  const isMobileViewport = useSyncExternalStore(
    subscribeToMobileViewport,
    getMobileViewportSnapshot,
    getServerMobileViewportSnapshot,
  );

  if (isMobileViewport) {
    return <>{children}</>;
  }

  return <ViewTransition {...props}>{children}</ViewTransition>;
}
