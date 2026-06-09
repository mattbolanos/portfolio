import { ArrowRight02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ExperienceEntry {
  company: string;
  description: string;
  startDate: string;
  endDate: string;
  imageUrl: string;
  role: string;
  hasDarkImage?: boolean;
}

const experienceEntries: ExperienceEntry[] = [
  {
    company: "Golden State Warriors",
    description:
      "Building internal software to influence front office decisions.",
    endDate: "Present",
    imageUrl: "/gsw.svg",
    role: "Full Stack Development",
    startDate: "Oct 2023",
  },
  {
    company: "Sports Info Solutions",
    description:
      "Created end-to-end pipelines and client-facing web applications.",
    endDate: "Oct 2023",
    hasDarkImage: true,
    imageUrl: "/sis.svg",
    role: "Basketball Research",
    startDate: "Oct 2021",
  },
];

export const Experience = () => {
  return (
    <div className="space-y-4.5">
      <div className="space-y-3">
        <h2>Experience</h2>
        <ul className="divide-border/50 flex flex-col divide-y">
          {experienceEntries.map((entry) => (
            <ExperienceItem entry={entry} key={entry.company} />
          ))}
        </ul>
      </div>
      <p className="text-sm sm:text-base">
        <Link
          className="text-link"
          href={"/matt-bolanos-resume.pdf" as Route}
          prefetch
          target="_blank"
        >
          Full CV
        </Link>
      </p>
    </div>
  );
};

function ExperienceItem({ entry }: { entry: ExperienceEntry }) {
  return (
    <li className="flex gap-x-3 py-3 first:pt-0 last:pb-0">
      <Image
        alt={entry.company}
        className={cn("image-card", entry.hasDarkImage && "dark:hidden")}
        height={52}
        priority
        src={entry.imageUrl}
        width={52}
      />
      {entry.hasDarkImage && (
        <Image
          alt={entry.company}
          className="image-card hidden dark:block"
          height={52}
          priority
          src={`${entry.imageUrl.replace(".svg", "-dark.svg")}`}
          width={52}
        />
      )}

      <div className="flex flex-1 flex-col items-start gap-0.5 sm:gap-1">
        <h3 className="text-sm leading-none font-normal sm:text-base">
          {entry.company}
        </h3>
        <p className="text-muted-foreground inline-flex flex-wrap items-center text-xs tracking-wide">
          {entry.role} • {entry.startDate}
          <HugeiconsIcon
            className="size-3 w-4.5"
            icon={ArrowRight02Icon}
            strokeWidth={2}
          />
          {entry.endDate}
        </p>
        <p className="text-xs sm:text-sm">{entry.description}</p>
      </div>
    </li>
  );
}
