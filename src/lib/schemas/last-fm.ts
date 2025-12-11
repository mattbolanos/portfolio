import { z } from "zod";

const ImageSchema = z.object({
  "#text": z.string().url().optional(),
  size: z.string(),
});

const ArtistSchema = z.object({
  "#text": z.string(),
  mbid: z.string(),
});

const AlbumSchema = z.object({
  "#text": z.string(),
  mbid: z.string(),
});

const DateSchema = z.object({
  "#text": z.string(),
  uts: z.string(),
});

const TrackSchema = z.object({
  album: AlbumSchema,
  artist: ArtistSchema,
  date: DateSchema.optional(),
  image: z.array(ImageSchema),
  mbid: z.string(),
  name: z.string(),
  streamable: z.string(),
  url: z.string().url(),
});

export const RecentTracksSchema = z.object({
  recenttracks: z.object({
    "@attr": z.object({
      page: z.string(),
      perPage: z.string(),
      total: z.string(),
      totalPages: z.string(),
      user: z.string(),
    }),
    track: z.array(TrackSchema),
  }),
});

export type RecentTrack = z.infer<typeof RecentTracksSchema>;
