"use client";

import { SunHorizonIcon } from "@phosphor-icons/react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <Button
      aria-label="toggle theme"
      className="size-10 rounded-full hover:scale-105 hover:shadow-lg"
      onMouseDown={() => setTheme(isDark ? "light" : "dark")}
      size="icon-lg"
      variant="ghost"
    >
      <SunHorizonIcon className="size-5 sm:size-6" />
    </Button>
  );
}
