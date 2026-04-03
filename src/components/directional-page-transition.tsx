import { type ReactNode, ViewTransition } from "react";

interface DirectionalPageTransitionProps {
  children: ReactNode;
}

export function DirectionalPageTransition({
  children,
}: DirectionalPageTransitionProps) {
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
