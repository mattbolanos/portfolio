import Link from "next/link";

export const Intro = () => (
  <div className="space-y-6 leading-relaxed">
    <p>
      I&apos;m a developer from the Bay Area, now based in New York City. I work
      as a data analyst and full-stack developer for the Basketball Analytics &
      Innovation team at the{" "}
      <Link
        className="text-link"
        href="https://www.nba.com/warriors"
        rel="noopener noreferrer"
        target="_blank"
      >
        Golden State Warriors
      </Link>
      .
    </p>
    <p>
      I spend my downtime trail running, tinkering on projects, and watching
      movies.
    </p>
  </div>
);
