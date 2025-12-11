import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ExperienceEntry {
  company: string;
  description: string;
  startDate: string;
  endDate: string;
  imageUrl: string;
  hasDarkImage?: boolean;
}

const experienceEntries: ExperienceEntry[] = [
  {
    company: "Golden State Warriors",
    description:
      "Building internal software to aid front office decision-making.",
    endDate: "Present",
    imageUrl: "/gsw.svg",
    startDate: "Oct 2023",
  },
  {
    company: "Sports Info Solutions",
    description:
      "Worked on the Basketball Research team. Created end-to-end data pipelines and client-facing web applications.",
    endDate: "Oct 2023",
    hasDarkImage: true,
    imageUrl: "/sis.svg",
    startDate: "Oct 2021",
  },
  {
    company: "Northwestern University Men's Basketball",
    description:
      "Created reports and dashboards for coaching staff and performance team. Developed strategic models and ETL scripts for lineup and shot location analysis.",
    endDate: "Mar 2021",
    imageUrl: "/northwestern.svg",
    startDate: "Aug 2020",
  },
];

export function Experience() {
  return (
    <div className="flex flex-col gap-y-3">
      <h2 className="font-medium md:text-lg">Experience</h2>
      <ul className="flex flex-col gap-y-8">
        {experienceEntries.map((entry) => (
          <ExperienceItem entry={entry} key={entry.company} />
        ))}
      </ul>
      <p>
        <Link
          className="text-link"
          href="/matt-bolanos-resume.pdf"
          prefetch
          target="_blank"
        >
          Full CV
        </Link>
      </p>
    </div>
  );
}

function ExperienceItem({ entry }: { entry: ExperienceEntry }) {
  return (
    <li className="flex gap-x-3">
      <div className="flex-none">
        <Image
          alt={entry.company}
          className={cn(
            "size-10 sm:size-12",
            entry.hasDarkImage && "dark:hidden",
          )}
          height={48}
          src={entry.imageUrl}
          width={48}
        />
        {entry.hasDarkImage && (
          <Image
            alt={entry.company}
            className="hidden size-10 sm:size-12 dark:block"
            height={48}
            src={`${entry.imageUrl.replace(".svg", "-dark.svg")}`}
            width={48}
          />
        )}
      </div>
      <div className="flex flex-1 flex-col items-start gap-y-1">
        <h3 className="text-sm leading-none font-normal sm:text-base">
          {entry.company}
        </h3>
        <p className="text-muted-foreground text-xs sm:text-sm">
          {entry.startDate} - {entry.endDate}
        </p>
        <p className="text-sm">{entry.description}</p>
      </div>
    </li>
  );
}
