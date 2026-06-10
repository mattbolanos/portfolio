import Image from "next/image";
import { cn } from "@/lib/utils";

interface ProjectTagProps {
  tag: string;
  size?: "sm" | "md";
  transitionName?: string;
}

interface TagLabelOverrides {
  tag: string;
  label: string;
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

function formatTagLabel(tag: string): string {
  const overrideLabel = PROJECT_TAG_LABEL_OVERRIDES.find(
    (labels) => labels.tag === tag,
  );

  if (overrideLabel) return overrideLabel.label;
  return tag.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

const PROJECT_TAG_LABEL_OVERRIDES: TagLabelOverrides[] = [
  { label: "Next.js", tag: "next.js" },
  {
    label: "TypeScript",
    tag: "typescript",
  },
];
