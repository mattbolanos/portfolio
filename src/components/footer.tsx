import Link from "next/link";
import { ThemeToggle } from "./theme/toggle";

export const Footer = () => {
  return (
    <footer className="px-8 pt-6 pb-12 text-xs md:text-sm">
      <div className="flex items-center justify-between">
        <p>
          <Link
            className="text-link"
            href="https://github.com/mattbolanos/portfolio"
            rel="noopener noreferrer"
            target="_blank"
          >
            Source
          </Link>
        </p>
        <ThemeToggle />
      </div>
    </footer>
  );
};
