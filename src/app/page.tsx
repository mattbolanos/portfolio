import Link from "next/link";
import { Suspense } from "react";
import { ContactLinks } from "@/components/contact-links";
import { Experience } from "@/components/experience";
import { TrackCard, TrackCardSkeleton } from "@/components/track-card";
import { RecentTracksSchema } from "@/lib/schemas/last-fm";

async function RecentTrackWrapper() {
  const res = await fetch(
    `https://ws.audioscrobbler.com/2.0/?` +
      new URLSearchParams({
        api_key: process.env.LASTFM_API_KEY as string,
        format: "json",
        limit: "3",
        method: "user.getrecenttracks",
        user: "mattbolanos",
      }),
    {
      next: {
        revalidate: 30,
      },
    },
  ).then((res) => res.json());

  const { success, data } = RecentTracksSchema.safeParse(res);

  if (!success) {
    return null;
  }

  const tracksWithUts = data.recenttracks.track.filter(
    (track) => track.date?.uts,
  );

  if (tracksWithUts.length === 0) {
    return null;
  }

  return <TrackCard latestTrack={tracksWithUts[0]} />;
}

export default function Home() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl leading-14 font-medium md:text-2xl">
        Matt Bolaños
      </h1>
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
      {/* experience */}
      <Experience />

      {/* recent track */}
      <Suspense fallback={<TrackCardSkeleton />}>
        <RecentTrackWrapper />
      </Suspense>

      {/* contact links */}
      <ContactLinks />
    </div>
  );
}
