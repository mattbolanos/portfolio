import Link from "next/link";

export const Intro = () => {
  return (
    <div className="space-y-6">
      <p>
        I&apos;m a developer based in New York City. I work as a full stack
        developer and data analyst for the Basketball Analytics and Innovation
        team at the{" "}
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
        I spend my downtime trail running, tinkering on projects, and{" "}
        <Link
          className="text-link"
          href="https://letterboxd.com/mattbolanos"
          rel="noopener noreferrer"
          target="_blank"
        >
          watching movies
        </Link>
        .
      </p>
    </div>
  );
};
