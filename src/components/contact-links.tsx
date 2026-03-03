import { LinkItem } from "./link-item";
import { GithubIcon } from "./ui/github";
import { LinkedinIcon } from "./ui/linkedin";
import { MailCheckIcon } from "./ui/mail-check";
import { TwitterIcon } from "./ui/twitter";

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
    Icon: MailCheckIcon,
    label: "Email",
  },
];

export const ContactLinks = () => {
  return (
    <div className="space-y-3">
      <h2>Connect</h2>
      <ul className="flex flex-wrap items-center gap-1.5">
        {LINKS.map((link) => (
          <li className="cursor-pointer" key={link.href}>
            <LinkItem href={link.href} Icon={link.Icon} label={link.label} />
          </li>
        ))}
      </ul>
    </div>
  );
};
