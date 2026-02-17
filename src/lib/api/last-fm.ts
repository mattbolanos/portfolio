import { cacheLife } from "next/cache";
import { type RecentTrack, RecentTracksSchema } from "./schemas/last-fm";

const LAST_FM_API_BASE_URL = "https://ws.audioscrobbler.com/2.0/?";

const fetchLastFmJson = async (
  params: URLSearchParams,
): Promise<unknown | null> => {
  try {
    const res = await fetch(`${LAST_FM_API_BASE_URL}${params.toString()}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return null;
    }

    return await res.json();
  } catch {
    return null;
  }
};

const fetchRecentTracksUncached = async (
  limit = 3,
): Promise<RecentTrack[] | null> => {
  const res = await fetchLastFmJson(
    new URLSearchParams({
      api_key: process.env.LASTFM_API_KEY as string,
      format: "json",
      limit: String(limit),
      method: "user.getrecenttracks",
      user: "mattbolanos",
    }),
  );

  const { success, data } = RecentTracksSchema.safeParse(res);

  if (!success) {
    return null;
  }

  return data.recenttracks.track.filter((track) => track.date?.uts);
};

const getRecentTracksCached = async (limit: number): Promise<RecentTrack[]> => {
  "use cache";
  cacheLife("minutes");

  const tracks = await fetchRecentTracksUncached(limit);

  if (!tracks || tracks.length === 0) {
    throw new Error("Unable to fetch Last.fm recent tracks");
  }

  return tracks;
};

export const getRecentTracks = async (
  limit = 3,
): Promise<RecentTrack[] | null> => {
  try {
    return await getRecentTracksCached(limit);
  } catch {
    return null;
  }
};
