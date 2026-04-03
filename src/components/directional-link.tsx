import type { Route } from "next";
import Link from "next/link";

interface DirectionalLinkProps {
  children: React.ReactNode;
  className?: string;
  direction: "nav-back" | "nav-forward";
  href: Route;
  prefetch?: boolean;
  scroll?: boolean;
}

export function DirectionalLink({
  children,
  className,
  direction,
  href,
  prefetch,
  scroll = true,
}: DirectionalLinkProps) {
  return (
    <Link
      className={className}
      href={href}
      prefetch={prefetch}
      scroll={scroll}
      transitionTypes={[direction]}
    >
      {children}
    </Link>
  );
}
