"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const Header = () => {
  const pathname = usePathname();
  const isHome = pathname === "/";

  if (isHome) {
    return (
      <div className="mb-8 w-fit md:mb-10">
        <h1 className="text-xl leading-snug font-semibold tracking-tight md:text-2xl">
          Matt Bolaños
        </h1>
        <div className="bg-primary mt-1.5 h-0.5 w-full" />
      </div>
    );
  }

  return (
    <div className="group mb-8 w-fit md:mb-10">
      <Link
        className="text-xl leading-snug font-semibold tracking-tight transition-opacity group-hover:opacity-60 md:text-2xl"
        href="/"
        prefetch
      >
        Matt Bolaños
      </Link>
      <div className="bg-primary mt-1.5 h-0.5 w-full transition-all duration-300 group-hover:w-0" />
    </div>
  );
};
