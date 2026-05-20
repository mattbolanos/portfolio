"use client";
import { usePathname } from "next/navigation";
import { Link } from "next-view-transitions";
import { cn } from "@/lib/utils";

const HEADER_BASE_CLASS =
  "text-lg leading-snug font-semibold tracking-tight md:text-xl";

export function Header() {
  const pathname = usePathname();

  return (
    <div className="mb-6 w-fit">
      {pathname === "/" ? (
        <h1 className={cn(HEADER_BASE_CLASS, "cursor-default")}>
          Matt Bolaños
        </h1>
      ) : (
        <Link href="/" prefetch>
          <h1 className={HEADER_BASE_CLASS}>Matt Bolaños</h1>
        </Link>
      )}
      <div className="bg-primary mt-1 h-0.5 w-full" />
    </div>
  );
}
