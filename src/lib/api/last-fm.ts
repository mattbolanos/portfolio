import { type RecentTrack, RecentTracksSchema } from "./schemas/last-fm";

export interface LastFmUserInfo {
  name: string;
  playcount: string;
  url: string;
  registered: string;
  image: string;
}

export const getRecentTracks = async (
  limit = 3,
): Promise<RecentTrack[] | null> => {
  const res = await fetch(
    `https://ws.audioscrobbler.com/2.0/?` +
      new URLSearchParams({
        api_key: process.env.LASTFM_API_KEY as string,
        format: "json",
        limit: String(limit),
        method: "user.getrecenttracks",
        user: "mattbolanos",
      }),
    { next: { revalidate: 300 } },
  ).then((res) => res.json());

  const { success, data } = RecentTracksSchema.safeParse(res);

  if (!success) {
    return null;
  }

  return data.recenttracks.track.filter((track) => track.date?.uts);
};

export const getUserInfo = async (): Promise<LastFmUserInfo | null> => {
  try {
    const res = await fetch(
      `https://ws.audioscrobbler.com/2.0/?` +
        new URLSearchParams({
          api_key: process.env.LASTFM_API_KEY as string,
          format: "json",
          method: "user.getinfo",
          user: "mattbolanos",
        }),
      { next: { revalidate: 3600 } },
    ).then((res) => res.json());

    const user = res?.user;
    if (!user) return null;

    const image =
      user.image?.find(
        (img: { "#text": string; size: string }) => img.size === "large",
      )?.["#text"] || "";

    return {
      image,
      name: user.name,
      playcount: user.playcount,
      registered: user.registered?.unixtime,
      url: user.url,
    };
  } catch {
    return null;
  }
};

// Keep backwards compatibility
export const getLatestTrack = async (): Promise<RecentTrack | null> => {
  const tracks = await getRecentTracks(3);
  return tracks?.[0] ?? null;
};
