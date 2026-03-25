"use client";

import { DarkModeIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { domAnimation, LazyMotion, m, useReducedMotion } from "motion/react";
import { useTheme } from "next-themes";
import * as React from "react";

const springBody = {
  bounce: 0.12,
  type: "spring" as const,
  visualDuration: 0.25,
};
const springMask = {
  bounce: 0.1,
  type: "spring" as const,
  visualDuration: 0.2,
};
const springRay = {
  bounce: 0.2,
  type: "spring" as const,
  visualDuration: 0.3,
};

export const ThemeToggle = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const shouldReduceMotion = useReducedMotion();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <span aria-hidden className="block size-9 shrink-0 rounded-full">
        <HugeiconsIcon
          className="text-theme-toggle size-6"
          icon={DarkModeIcon}
        />
      </span>
    );
  }

  const isDark = resolvedTheme === "dark";
  const noMotion = shouldReduceMotion ?? false;

  return (
    <LazyMotion features={domAnimation}>
      <button
        aria-label="Toggle theme"
        className="focus-visible:ring-ring hover:bg-accent/60 dark:hover:bg-accent relative flex size-9 cursor-pointer items-center justify-center rounded-full transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:cursor-default"
        onClick={() => setTheme(isDark ? "light" : "dark")}
        type="button"
      >
        <m.svg
          animate={{ rotate: noMotion ? 0 : isDark ? 0 : 20 }}
          className="text-theme-toggle size-6 overflow-visible filter-(--theme-toggle-glow)"
          fill="currentColor"
          transition={springBody}
          viewBox="0 0 24 24"
        >
          <title>Toggle theme</title>

          <mask id="theme-toggle-mask">
            <rect fill="white" height="24" width="24" x="0" y="0" />
            <m.circle
              animate={{
                cx: isDark ? 28 : 16,
                cy: isDark ? -2 : 6,
              }}
              cx={28}
              cy={-2}
              fill="black"
              r="8"
              transition={noMotion ? { duration: 0 } : springMask}
            />
          </mask>

          <m.circle
            animate={{
              r: isDark ? 7 : 10,
            }}
            cx="12"
            cy="12"
            fill="currentColor"
            mask="url(#theme-toggle-mask)"
            r={7}
            stroke="none"
            transition={noMotion ? { duration: 0 } : springBody}
          />

          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            const x = 12 + 9.5 * Math.cos(rad);
            const y = 12 + 9.5 * Math.sin(rad);
            return (
              <m.circle
                animate={{
                  opacity: isDark ? 1 : 0,
                  scale: isDark ? 1 : 0.4,
                }}
                cx={x}
                cy={y}
                fill="currentColor"
                key={angle}
                r={angle % 90 === 0 ? 1.6 : 1.2}
                stroke="none"
                style={{ transformOrigin: `${x}px ${y}px` }}
                transition={
                  noMotion
                    ? { duration: 0 }
                    : { ...springRay, delay: isDark ? i * 0.03 : 0 }
                }
              />
            );
          })}
        </m.svg>
      </button>
    </LazyMotion>
  );
};
