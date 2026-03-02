"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const Header = () => {
  const pathname = usePathname();
  const isHome = pathname === "/";

  const title = isHome ? (
    <h1 className="text-xl leading-snug font-semibold tracking-tight md:text-2xl">
      Matt Bolaños
    </h1>
  ) : (
    <Link
      className="text-xl leading-snug font-semibold tracking-tight md:text-2xl"
      href="/"
    >
      Matt Bolaños
    </Link>
  );

  return (
    <div className="mb-8 w-fit md:mb-10">
      {title}
      <div className="bg-primary mt-1.5 h-0.5 w-full" />
    </div>
  );
};
