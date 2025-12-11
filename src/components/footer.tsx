import Link from "next/link";
import { ThemeToggle } from "./theme/toggle";

export function Footer() {
  return (
    <footer className="pb-16 px-6 pt-6 text-xs sm:text-sm">
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
