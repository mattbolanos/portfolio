"use client";

import { SunriseIcon, SunsetIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <Button
      aria-label="toggle theme"
      className="dark:hover:border-input hover:border-border size-10 rounded-full hover:scale-105 hover:shadow-lg"
      onMouseDown={() => setTheme(isDark ? "light" : "dark")}
      size="icon-lg"
      variant="ghost"
    >
      <HugeiconsIcon
        className={cn(
          "size-6",
          isDark
            ? "group-hover/button:text-blue-400"
            : "group-hover/button:text-amber-600",
        )}
        icon={isDark ? SunriseIcon : SunsetIcon}
      />
    </Button>
  );
}
