"use client";

import { usePathname } from "next/navigation";
import { Link } from "next-view-transitions";

export function Logo() {
  const pathname = usePathname();

  return (
    <span className="text-lg leading-snug font-semibold tracking-tight md:text-xl">
      {pathname === "/" ? (
        <h1 className="cursor-default">Matt Bolaños</h1>
      ) : (
        <Link href="/" prefetch>
          <h1>Matt Bolaños</h1>
        </Link>
      )}
    </span>
  );
}
