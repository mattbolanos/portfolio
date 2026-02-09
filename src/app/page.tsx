import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl leading-14 font-medium md:text-2xl">
          Matt Bolaños
        </h1>
      </header>
      <p>
        I'm a developer based in New York City. I work as a full stack developer
        and data analyst for the Basketball Analytics and Innovation team at the{" "}
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
        I spend my downtime trail running, gluten-free baking and{" "}
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
}
