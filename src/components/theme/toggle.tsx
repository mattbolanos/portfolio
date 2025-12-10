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
      className="size-10 rounded-full"
      onMouseDown={() => setTheme(isDark ? "light" : "dark")}
      size="icon-lg"
      variant="outline"
    >
      <SunHorizonIcon className="size-5" />
    </Button>
  );
}
