import {
  GithubLogoIcon,
  LinkedinLogoIcon,
  MailboxIcon,
  TwitterLogoIcon,
} from "@phosphor-icons/react/dist/ssr";
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
    icon: <GithubLogoIcon className="size-5 sm:size-6" />,
    title: "GitHub",
  },
  {
    href: "https://x.com/mattabolanos",
    icon: <TwitterLogoIcon className="size-5 sm:size-6" />,
    title: "Twitter",
  },
  {
    href: "https://www.linkedin.com/in/mattbolanos/",
    icon: <LinkedinLogoIcon className="size-5 sm:size-6" />,
    title: "LinkedIn",
  },
  {
    href: "mailto:matthew.a.bolanos@gmail.com",
    icon: <MailboxIcon className="size-5 sm:size-6" />,
    title: "Email",
  },
];

export function ContactLinks() {
  return (
    <div className="flex flex-col gap-y-3">
      <h2 className="font-medium md:text-lg">Contact me</h2>
      <ul className="flex items-center gap-x-4">
        {contactLinks.map((link) => (
          <li key={link.href} title={link.title}>
            <Button
              asChild
              className="size-10 rounded-full"
              size="icon-lg"
              variant="outline"
            >
              <Link href={link.href} rel="noopener noreferrer" target="_blank">
                {link.icon}
              </Link>
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
