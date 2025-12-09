import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto max-w-2xl space-y-4 px-6 py-10 md:py-20">
      <h1 className="text-xl leading-14 font-medium md:text-2xl">
        Matt Bolaños
      </h1>
      <p>
        I'm a developer based in New York City. I work at the{" "}
        <Link
          className="transition-opacity duration-150 ease-in-out hover:opacity-60"
          href="https://www.nba.com/warriors"
          rel="noopener noreferrer"
          target="_blank"
        >
          Golden State Warriors
        </Link>{" "}
        as a full stack developer and data analyst in their front office.
      </p>
      <p>
        In my free time I enjoy trail running, gluten-free baking and{" "}
        <Link
          className="transition-opacity duration-150 ease-in-out hover:opacity-60"
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
