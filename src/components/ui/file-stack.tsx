"use client";

import { domAnimation, LazyMotion, m, useAnimation } from "motion/react";
import type { HTMLAttributes, Ref } from "react";
import { useCallback, useImperativeHandle, useRef } from "react";

import { cn } from "@/lib/utils";

interface FileStackIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface FileStackIconProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<FileStackIconHandle>;
  size?: number;
}

function FileStackIcon({
  ref,
  onMouseEnter,
  onMouseLeave,
  className,
  size = 28,
  ...props
}: FileStackIconProps) {
  const controls = useAnimation();
  const isControlledRef = useRef(false);

  useImperativeHandle(ref, () => {
    isControlledRef.current = true;

    return {
      startAnimation: () => controls.start("animate"),
      stopAnimation: () => controls.start("normal"),
    };
  });

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isControlledRef.current) {
        onMouseEnter?.(e);
      } else {
        controls.start("animate");
      }
    },
    [controls, onMouseEnter],
  );

  const handleMouseLeave = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isControlledRef.current) {
        onMouseLeave?.(e);
      } else {
        controls.start("normal");
      }
    },
    [controls, onMouseLeave],
  );

  return (
    <LazyMotion features={domAnimation}>
      <div
        className={cn(className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        <svg
          fill="none"
          height={size}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>File Stack</title>
          <m.path
            animate={controls}
            d="M21 7h-3a2 2 0 0 1-2-2V2"
            variants={{
              animate: { translateX: -4, translateY: 4 },
              normal: { translateX: 0, translateY: 0 },
            }}
          />
          <m.path
            animate={controls}
            d="M21 6v6.5c0 .8-.7 1.5-1.5 1.5h-7c-.8 0-1.5-.7-1.5-1.5v-9c0-.8.7-1.5 1.5-1.5H17Z"
            variants={{
              animate: { translateX: -4, translateY: 4 },
              normal: { translateX: 0, translateY: 0 },
            }}
          />
          <path d="M7 8v8.8c0 .3.2.6.4.8.2.2.5.4.8.4H15" />
          <m.path
            animate={controls}
            d="M3 12v8.8c0 .3.2.6.4.8.2.2.5.4.8.4H11"
            variants={{
              animate: { translateX: 4, translateY: -4 },
              normal: { translateX: 0, translateY: 0 },
            }}
          />
        </svg>
      </div>
    </LazyMotion>
  );
}

export { FileStackIcon };
