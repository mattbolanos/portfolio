"use client";

import { domAnimation, LazyMotion, m } from "motion/react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

const spring = { bounce: 0.15, type: "spring" as const, visualDuration: 0.35 };

export const ThemeToggle = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <LazyMotion features={domAnimation}>
      <button
        aria-label="Toggle theme"
        className="focus-visible:ring-ring hover:bg-accent/60 dark:hover:bg-accent relative flex size-9 cursor-pointer items-center justify-center rounded-full transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:cursor-default"
        disabled={!mounted}
        onClick={() => {
          if (!mounted) return;
          setTheme(isDark ? "light" : "dark");
        }}
        type="button"
      >
        <m.svg
          animate={{ rotate: isDark ? 0 : 30 }}
          className="size-6"
          fill="currentColor"
          style={{
            color: isDark ? "oklch(0.78 0.16 70)" : "oklch(0.88 0.03 240)",
            filter: isDark
              ? "drop-shadow(0 0 2px oklch(0.82 0.18 70 / 0.5)) drop-shadow(0 0 7px oklch(0.75 0.14 65 / 0.2))"
              : "drop-shadow(0 0 3px oklch(0.85 0.04 240 / 0.5)) drop-shadow(0 0 8px oklch(0.80 0.05 240 / 0.2))",
            overflow: "visible",
          }}
          transition={spring}
          viewBox="0 0 24 24"
        >
          <title>Toggle theme</title>

          {/* Mask: circle slides in to carve crescent */}
          <mask id="theme-toggle-mask">
            <rect fill="white" height="24" width="24" x="0" y="0" />
            <m.circle
              animate={{
                cx: isDark ? 28 : 17,
                cy: isDark ? -2 : 7,
              }}
              cx={28}
              cy={-2}
              fill="black"
              r="9"
              transition={spring}
            />
          </mask>

          {/* Body: full disc masked into crescent for moon */}
          <m.circle
            animate={{
              r: isDark ? 5.5 : 10,
            }}
            cx="12"
            cy="12"
            fill="currentColor"
            mask="url(#theme-toggle-mask)"
            r={5.5}
            stroke="none"
            transition={spring}
          />

          {/* Sun rays */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
            const rad = (angle * Math.PI) / 180;
            const x = 12 + 9.5 * Math.cos(rad);
            const y = 12 + 9.5 * Math.sin(rad);
            return (
              <m.circle
                animate={{
                  opacity: isDark ? 1 : 0,
                  scale: isDark ? 1 : 0,
                }}
                cx={x}
                cy={y}
                fill="currentColor"
                key={angle}
                r={angle % 90 === 0 ? 1.6 : 1.2}
                stroke="none"
                style={{ transformOrigin: `${x}px ${y}px` }}
                transition={spring}
              />
            );
          })}
        </m.svg>
      </button>
    </LazyMotion>
  );
};
