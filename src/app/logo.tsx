"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Logo() {
  const pathname = usePathname();

  return (
    <span className="text-lg leading-snug font-semibold tracking-tight md:text-xl">
      {pathname === "/" ? (
        <h1 className="cursor-default">Matt Bolaños</h1>
      ) : (
        <Link href="/" prefetch transitionTypes={["nav-back"]}>
          <h1>Matt Bolaños</h1>
        </Link>
      )}
    </span>
  );
}
