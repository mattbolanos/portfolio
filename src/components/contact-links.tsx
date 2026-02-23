"use client";

import Link from "next/link";
import { useRef } from "react";
import { GithubIcon } from "./ui/github";
import { LinkedinIcon } from "./ui/linkedin";
import { SendIcon } from "./ui/send";
import { TwitterIcon } from "./ui/twitter";

const ICON_SIZE = 18;

interface IconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

type ContactIconComponent = React.ForwardRefExoticComponent<
  { size?: number } & React.RefAttributes<IconHandle>
>;

interface ContactLink {
  href: string;
  label: string;
  Icon: ContactIconComponent;
}

const LINKS: ContactLink[] = [
  {
    href: "https://github.com/mattbolanos",
    Icon: GithubIcon,
    label: "GitHub",
  },
  {
    href: "https://x.com/mattabolanos",
    Icon: TwitterIcon,
    label: "Twitter",
  },
  {
    href: "https://www.linkedin.com/in/mattbolanos/",
    Icon: LinkedinIcon,
    label: "LinkedIn",
  },
  {
    href: "mailto:matthew.a.bolanos@gmail.com",
    Icon: SendIcon,
    label: "Email",
  },
];

function ContactLinkItem({ href, label, Icon }: ContactLink) {
  const iconRef = useRef<IconHandle>(null);

  return (
    <li className="cursor-pointer">
      <Link
        className="border-border bg-input/10 dark:bg-card flex items-center gap-2 rounded-full border px-3.5 py-2 transition-transform duration-150 [text-decoration:none] hover:scale-105 motion-reduce:transition-none"
        href={href}
        onMouseEnter={() => iconRef.current?.startAnimation()}
        onMouseLeave={() => iconRef.current?.stopAnimation()}
        rel="noopener noreferrer"
        target="_blank"
      >
        <Icon ref={iconRef} size={ICON_SIZE} />
        <span
          className="text-foreground/80 text-xs font-medium tracking-wide"
          style={{ textDecoration: "none" }}
        >
          {label}
        </span>
      </Link>
    </li>
  );
}

export const ContactLinks = () => {
  return (
    <div className="space-y-3">
      <h2>Connect</h2>
      <ul className="flex flex-wrap items-center gap-1.5">
        {LINKS.map((link) => (
          <ContactLinkItem key={link.href} {...link} />
        ))}
      </ul>
    </div>
  );
};
