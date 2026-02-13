import {
  GithubIcon,
  LinkedinIcon,
  Mail01Icon,
  TwitterIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { Button } from "./ui/button";

interface ContactLink {
  href: string;
  icon: React.ReactNode;
  title: string;
}

const contactLinks: ContactLink[] = [
  {
    href: "https://github.com/mattbolanos",
    icon: <HugeiconsIcon className="size-5 sm:size-6" icon={GithubIcon} />,
    title: "GitHub",
  },
  {
    href: "https://x.com/mattabolanos",
    icon: <HugeiconsIcon className="size-5 sm:size-6" icon={TwitterIcon} />,
    title: "Twitter",
  },
  {
    href: "https://www.linkedin.com/in/mattbolanos/",
    icon: <HugeiconsIcon className="size-5 sm:size-6" icon={LinkedinIcon} />,
    title: "LinkedIn",
  },
  {
    href: "mailto:matthew.a.bolanos@gmail.com",
    icon: <HugeiconsIcon className="size-5 sm:size-6" icon={Mail01Icon} />,
    title: "Email",
  },
];

export function ContactLinks() {
  return (
    <div className="space-y-3">
      <h2>Connect</h2>
      <ul className="flex items-center gap-x-3">
        {contactLinks.map((link) => (
          <li key={link.href} title={link.title}>
            <Link href={link.href} rel="noopener noreferrer" target="_blank">
              <Button
                className="size-10 cursor-pointer rounded-full"
                size="icon-lg"
                variant="outline"
              >
                {link.icon}
              </Button>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
