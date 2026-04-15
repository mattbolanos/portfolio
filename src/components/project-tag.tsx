import Image from "next/image";
import { formatTagLabel, type Project } from "@/lib/projects";
import { cn } from "@/lib/utils";

interface ProjectTagProps {
  tag: Project["tags"][number];
  size?: "sm" | "md";
  transitionName?: string;
}

const SIZE_STYLES = {
  md: {
    icon: "size-3.5 sm:size-4",
    wrapper: "px-3 py-1.5",
  },
  sm: {
    icon: "size-3.5 sm:size-4",
    wrapper: "px-2 py-0.5",
  },
} as const;

export const ProjectTag = ({
  tag,
  size = "md",
  transitionName,
}: ProjectTagProps) => {
  const label = formatTagLabel(tag);
  const styles = SIZE_STYLES[size];

  return (
    <div
      className={cn(
        "border-border bg-card flex items-center justify-center gap-x-1 rounded-full border",
        styles.wrapper,
      )}
      style={
        transitionName ? { viewTransitionName: transitionName } : undefined
      }
      title={label}
    >
      <Image
        alt={label}
        className={styles.icon}
        height={16}
        src={`/stack/${tag}.svg`}
        width={16}
      />
      <span className="text-[11px] sm:text-xs">{label}</span>
    </div>
  );
};
