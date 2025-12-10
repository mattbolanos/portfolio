import {
  GithubLogoIcon,
  LinkedinLogoIcon,
  MailboxIcon,
  TwitterLogoIcon,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

interface ContactLink {
  href: string;
  icon: React.ReactNode;
}

const contactLinks: ContactLink[] = [
  {
    href: "https://github.com/mattbolanos",
    icon: <GithubLogoIcon className="size-5 sm:size-6" />,
  },
  {
    href: "https://x.com/mattabolanos",
    icon: <TwitterLogoIcon className="size-5 sm:size-6" />,
  },
  {
    href: "https://www.linkedin.com/in/mattbolanos/",
    icon: <LinkedinLogoIcon className="size-5 sm:size-6" />,
  },
  {
    href: "mailto:matthew.a.bolanos@gmail.com",
    icon: <MailboxIcon className="size-5 sm:size-6" />,
  },
];

export function ContactLinks() {
  return (
    <div className="flex flex-col gap-y-3">
      <h2 className="font-medium md:text-lg">Contact me</h2>
      <ul className="flex items-center gap-x-4">
        {contactLinks.map((link) => (
          <li key={link.href}>
            <Link href={link.href} rel="noopener noreferrer" target="_blank">
              <div className="group border-border text-muted-foreground hover:border-foreground/20 hover:bg-accent hover:text-foreground w-fit rounded-full border p-2 transition-all duration-300 hover:shadow-lg sm:p-3">
                {link.icon}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
