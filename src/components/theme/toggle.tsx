"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/* ── Easing presets ── */
const SPRING = "cubic-bezier(0.34, 1.56, 0.64, 1)"; // overshoot
const EASE_OUT = "cubic-bezier(0.16, 1, 0.3, 1)"; // expo-out

/* ── Body (sun disc / moon crescent) ── */
const BODY = {
  duration: 500, // ms
  moonScale: 1, // scale when showing moon
  sunScale: 0.5, // scale when showing sun — compact to let rays breathe
};

/* ── Crescent mask ── */
const MASK = {
  duration: 500, // ms
  moonOffset: "translate(4px, -4px)", // slides in to carve crescent
  sunOffset: "translate(14px, -14px)", // offscreen — no carve
};

/* ── Icon rotation ── */
const ICON = {
  duration: 650, // ms
  moonAngle: 25, // degrees rotated in dark mode
  sunAngle: 0, // degrees in light mode
};

/* ── Stars: 3 tiny circles that appear around the crescent in dark mode ── */
const STAR_CONFIG = {
  duration: { entering: 380, exiting: 120 },
  stagger: { entering: 60, exiting: 0 },
};

const STARS = [
  { cx: 3.5, cy: 5, r: 0.8 },
  { cx: 19, cy: 7.5, r: 1.2 },
  { cx: 6, cy: 19.5, r: 1 },
];

/* ── Craters: subtle surface detail on the moon face ── */
const CRATERS = [
  { cx: 9.5, cy: 13.5, r: 1.8 },
  { cx: 13, cy: 9, r: 1.1 },
];

/* ── Sun rays: 8 elegantly tapered rays at 45° intervals ── */
const RAY_CONFIG = {
  cardinalBaseHW: 1.5, // slender base for refined taper
  diagonalBaseHW: 1.1, // thinner diagonal rays
  duration: { entering: 460, exiting: 220 },
  innerR: 6.8, // starts just outside the sun body
  longOuterR: 14, // cardinal rays — dramatically long
  shortOuterR: 12, // diagonal rays — proportionally long
  stagger: { entering: 35, exiting: 15 },
};

const RAYS = Array.from({ length: 8 }, (_, i) => {
  const angle = (i * 45 * Math.PI) / 180;
  const sin = Math.sin(angle);
  const cos = Math.cos(angle);
  const isCardinal = i % 2 === 0;
  const outerR = isCardinal ? RAY_CONFIG.longOuterR : RAY_CONFIG.shortOuterR;
  const baseHW = isCardinal
    ? RAY_CONFIG.cardinalBaseHW
    : RAY_CONFIG.diagonalBaseHW;

  // Perpendicular offsets for base width
  const px = cos;
  const py = sin;

  // Base corners (wide end at innerR)
  const bx1 = 12 + RAY_CONFIG.innerR * sin - baseHW * px;
  const by1 = 12 - RAY_CONFIG.innerR * cos - baseHW * py;
  const bx2 = 12 + RAY_CONFIG.innerR * sin + baseHW * px;
  const by2 = 12 - RAY_CONFIG.innerR * cos + baseHW * py;

  // Tip point (pointed end at outerR)
  const tx = 12 + outerR * sin;
  const ty = 12 - outerR * cos;

  // Control points at ~55% ray length, ~20% base width for sleek taper
  const cpR = RAY_CONFIG.innerR + (outerR - RAY_CONFIG.innerR) * 0.55;
  const cpW = baseHW * 0.2;
  const cpx1 = 12 + cpR * sin - cpW * px;
  const cpy1 = 12 - cpR * cos - cpW * py;
  const cpx2 = 12 + cpR * sin + cpW * px;
  const cpy2 = 12 - cpR * cos + cpW * py;

  const f = (n: number) => +n.toFixed(2);
  const d = [
    `M${f(bx1)},${f(by1)}`,
    `C${f(cpx1)},${f(cpy1)} ${f(tx)},${f(ty)} ${f(tx)},${f(ty)}`,
    `C${f(tx)},${f(ty)} ${f(cpx2)},${f(cpy2)} ${f(bx2)},${f(by2)}`,
    "Z",
  ].join(" ");

  return { d, isCardinal };
});

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      aria-label="Toggle theme"
      className={cn(
        "focus-visible:ring-ring relative flex size-9 cursor-pointer items-center justify-center rounded-full transition-all duration-300 hover:scale-110 focus-visible:ring-2 focus-visible:outline-none active:scale-90 disabled:pointer-events-none disabled:cursor-default disabled:hover:scale-100 disabled:active:scale-100",
        isDark ? "hover:bg-amber-100/10" : "hover:bg-amber-500/10",
      )}
      disabled={!mounted}
      onClick={() => {
        if (!mounted) return;
        setTheme(isDark ? "light" : "dark");
      }}
      type="button"
    >
      <svg
        className="size-5"
        fill="currentColor"
        stroke="currentColor"
        strokeLinecap="round"
        style={{
          color: isDark ? "oklch(0.92 0.02 80)" : "oklch(0.78 0.16 70)",
          filter: isDark
            ? "drop-shadow(0 0 2px oklch(0.95 0.02 80 / 0.6)) drop-shadow(0 0 8px oklch(0.88 0.03 75 / 0.25))"
            : "drop-shadow(0 0 2px oklch(0.82 0.18 70 / 0.5)) drop-shadow(0 0 7px oklch(0.75 0.14 65 / 0.2))",
          overflow: "visible",
          transform: `rotate(${isDark ? ICON.moonAngle : ICON.sunAngle}deg)`,
          transition: `transform ${ICON.duration}ms ${SPRING}, filter 500ms ease, color 400ms ease`,
        }}
        viewBox="0 0 24 24"
      >
        <title>Toggle theme</title>

        {/* Mask: black circle slides in to carve the crescent */}
        <mask id="theme-toggle-mask">
          <rect fill="white" height="24" width="24" x="0" y="0" />
          <circle
            cx="12"
            cy="12"
            fill="black"
            r="9"
            style={{
              transform: isDark ? MASK.moonOffset : MASK.sunOffset,
              transition: `transform ${MASK.duration}ms ${SPRING}`,
            }}
          />
        </mask>

        {/* Body: sun disc ↔ moon crescent */}
        <g
          mask="url(#theme-toggle-mask)"
          style={{
            transform: `scale(${isDark ? BODY.moonScale : BODY.sunScale})`,
            transformOrigin: "12px 12px",
            transition: `transform ${BODY.duration}ms ${SPRING}`,
          }}
        >
          <circle cx="12" cy="12" fill="currentColor" r="12" stroke="none" />
          {/* Crater hints — clipped by the crescent mask */}
          {CRATERS.map((c) => (
            <circle
              cx={c.cx}
              cy={c.cy}
              fill="currentColor"
              key={`crater-${c.cx}-${c.cy}`}
              r={c.r}
              stroke="none"
              style={{
                filter: "brightness(0.85)",
                opacity: isDark ? 0.08 : 0,
                transition: `opacity 400ms ease`,
              }}
            />
          ))}
        </g>

        {/* Sun rays — individually staggered with spring overshoot */}
        {RAYS.map((ray, i) => (
          <path
            d={ray.d}
            fill="currentColor"
            key={`ray-${ray.d}`}
            stroke="none"
            style={{
              opacity: isDark ? 0 : ray.isCardinal ? 1 : 0.82,
              transform: isDark ? "scale(0)" : "scale(1)",
              transformOrigin: "12px 12px",
              transition: isDark
                ? `opacity 80ms ease ${i * RAY_CONFIG.stagger.exiting}ms, transform ${RAY_CONFIG.duration.exiting}ms ${EASE_OUT} ${i * RAY_CONFIG.stagger.exiting}ms`
                : `opacity 80ms ease ${180 + i * RAY_CONFIG.stagger.entering}ms, transform ${RAY_CONFIG.duration.entering}ms ${SPRING} ${120 + i * RAY_CONFIG.stagger.entering}ms`,
            }}
          />
        ))}

        {/* Stars — staggered entrance around the crescent in dark mode */}
        {STARS.map((star, i) => (
          <circle
            cx={star.cx}
            cy={star.cy}
            fill="currentColor"
            key={`star-${star.cx}-${star.cy}`}
            r={star.r}
            stroke="none"
            style={{
              opacity: isDark ? 1 : 0,
              transform: isDark ? "scale(1)" : "scale(0)",
              transformOrigin: `${star.cx}px ${star.cy}px`,
              transition: isDark
                ? `opacity 120ms ease ${200 + i * STAR_CONFIG.stagger.entering}ms, transform ${STAR_CONFIG.duration.entering}ms ${SPRING} ${200 + i * STAR_CONFIG.stagger.entering}ms`
                : `opacity ${STAR_CONFIG.duration.exiting}ms ease, transform ${STAR_CONFIG.duration.exiting}ms ease`,
            }}
          />
        ))}
      </svg>
    </button>
  );
}
