import Link from "next/link";
import { ThemeToggle } from "./theme/toggle";

export function Footer() {
  return (
    <footer className="px-6 pt-6 pb-16 text-xs sm:pb-6 md:text-sm">
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
}
