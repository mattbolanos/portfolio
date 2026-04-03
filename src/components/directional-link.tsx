"use client";

import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { addTransitionType, startTransition } from "react";

interface DirectionalLinkProps {
  children: React.ReactNode;
  className?: string;
  cleanupProjectHashOnArrival?: boolean;
  direction: "nav-back" | "nav-forward";
  href: Route;
  prefetch?: boolean;
  scroll?: boolean;
}

function isPlainLeftClick(event: React.MouseEvent<HTMLAnchorElement>) {
  return (
    event.button === 0 &&
    !event.altKey &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.shiftKey
  );
}

export function DirectionalLink({
  children,
  className,
  direction,
  href,
  prefetch,
  scroll = true,
}: DirectionalLinkProps) {
  const router = useRouter();

  return (
    <Link
      className={className}
      href={href}
      onClick={(event) => {
        if (!isPlainLeftClick(event)) return;

        event.preventDefault();

        startTransition(() => {
          addTransitionType(direction);
          router.push(href, { scroll });
        });
      }}
      prefetch={prefetch}
    >
      {children}
    </Link>
  );
}
