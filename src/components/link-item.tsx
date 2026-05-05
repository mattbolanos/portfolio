"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

interface IconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

type IconComponent = React.ComponentType<{
  ref?: React.Ref<IconHandle>;
  size?: number;
}>;

interface LinkItemProps {
  href: string;
  label: string;
  Icon: IconComponent;
  size?: number;
  className?: string;
}

export const LinkItem = ({
  href,
  label,
  Icon,
  size = 18,
  className,
}: LinkItemProps) => {
  const iconRef = useRef<IconHandle>(null);

  return (
    <a
      className={cn(
        "border-border bg-card flex items-center gap-2 rounded-full border px-3.5 py-2 transition-transform duration-150 [text-decoration:none] hover:scale-105 motion-reduce:transition-none",
        className,
      )}
      href={href}
      onMouseEnter={() => iconRef.current?.startAnimation()}
      onMouseLeave={() => iconRef.current?.stopAnimation()}
      rel="noopener noreferrer"
      target="_blank"
    >
      <Icon ref={iconRef} size={size} />
      <span
        className="text-foreground/80 text-xs font-medium tracking-wide"
        style={{ textDecoration: "none" }}
      >
        {label}
      </span>
    </a>
  );
};
