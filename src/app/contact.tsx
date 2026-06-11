import { GithubIcon } from "@/components/ui/github";
import { LinkedinIcon } from "@/components/ui/linkedin";
import { MailboxIcon } from "@/components/ui/mailbox";
import { TwitterIcon } from "@/components/ui/twitter";
import { ItemLink } from "./item-link";

interface IconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

type ContactIconComponent = React.ComponentType<{
  ref?: React.Ref<IconHandle>;
  size?: number;
}>;

interface ContactItem {
  href: string;
  label: string;
  Icon: ContactIconComponent;
}

const ITEMS: ContactItem[] = [
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
    href: "mailto:maugbolanos@gmail.com",
    Icon: MailboxIcon,
    label: "Email",
  },
];

export const Contact = () => {
  return (
    <section className="space-y-3">
      <h2>Connect</h2>
      <ul className="flex flex-wrap items-center gap-1.5">
        {ITEMS.map((item) => (
          <li className="cursor-pointer" key={item.href}>
            <ItemLink href={item.href} Icon={item.Icon} label={item.label} />
          </li>
        ))}
      </ul>
    </section>
  );
};
