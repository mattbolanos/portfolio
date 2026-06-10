import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

export const Footer = () => {
  return (
    <footer className="md:px-6 px-5 pt-6 pb-12 text-sm md:text-base">
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
