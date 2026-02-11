import { type RecentTrack, RecentTracksSchema } from "./schemas/last-fm";

export const getLatestTrack = async (): Promise<RecentTrack | null> => {
  const res = await fetch(
    `https://ws.audioscrobbler.com/2.0/?` +
      new URLSearchParams({
        api_key: process.env.LASTFM_API_KEY as string,
        format: "json",
        limit: "3",
        method: "user.getrecenttracks",
        user: "mattbolanos",
      }),
  ).then((res) => res.json());

  const { success, data } = RecentTracksSchema.safeParse(res);

  if (!success) {
    return null;
  }

  const tracksWithUts = data.recenttracks.track.filter(
    (track) => track.date?.uts,
  );

  return tracksWithUts[0];
};
