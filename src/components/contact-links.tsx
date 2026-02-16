"use client";

import Link from "next/link";
import { useRef } from "react";
import { GithubIcon } from "./ui/github";
import { LinkedinIcon } from "./ui/linkedin";
import { MailCheckIcon } from "./ui/mail-check";
import { TwitterIcon } from "./ui/twitter";

const ICON_SIZE = 18;

interface IconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface ContactLink {
  href: string;
  label: string;
  renderIcon: (ref: React.Ref<IconHandle>) => React.ReactNode;
}

const LINKS: ContactLink[] = [
  {
    href: "https://github.com/mattbolanos",
    label: "GitHub",
    renderIcon: (ref) => <GithubIcon ref={ref} size={ICON_SIZE} />,
  },
  {
    href: "https://x.com/mattabolanos",
    label: "Twitter",
    renderIcon: (ref) => <TwitterIcon ref={ref} size={ICON_SIZE} />,
  },
  {
    href: "https://www.linkedin.com/in/mattbolanos/",
    label: "LinkedIn",
    renderIcon: (ref) => <LinkedinIcon ref={ref} size={ICON_SIZE} />,
  },
  {
    href: "mailto:matthew.a.bolanos@gmail.com",
    label: "Email",
    renderIcon: (ref) => <MailCheckIcon ref={ref} size={ICON_SIZE} />,
  },
];

function ContactLinkItem({ href, label, renderIcon }: ContactLink) {
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
        {renderIcon(iconRef)}
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
