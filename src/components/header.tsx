"use client";

import { usePathname } from "next/navigation";
import { DirectionalLink } from "@/components/directional-link";

export const Header = () => {
  const pathname = usePathname();
  const isHome = pathname === "/";

  if (isHome) {
    return (
      <div
        className="pointer-events-none mb-6 w-fit"
        style={{ viewTransitionName: "site-header" }}
      >
        <h1 className="text-xl leading-snug font-semibold tracking-tight md:text-2xl">
          Matt Bolaños
        </h1>
        <div className="bg-primary mt-1.5 h-0.5 w-full" />
      </div>
    );
  }

  return (
    <div
      className="group mb-6 w-fit"
      style={{ viewTransitionName: "site-header" }}
    >
      <DirectionalLink
        className="text-xl leading-snug font-semibold tracking-tight transition-opacity group-hover:opacity-60 md:text-2xl"
        direction="nav-back"
        href="/"
        prefetch
      >
        Matt Bolaños
      </DirectionalLink>
      <div className="bg-primary mt-1.5 h-0.5 w-full transition-all duration-300 group-hover:w-0" />
    </div>
  );
};
