import { z } from "zod";

export const StravaActivitySchema = z.object({
  distance: z.number(),
  elapsed_time: z.number(),
  id: z.number(),
  moving_time: z.number(),
  name: z.string(),
  sport_type: z.string(),
  start_date: z.iso.datetime({ offset: true }),
  start_date_local: z.iso.datetime({ offset: true }),
  total_elevation_gain: z.number(),
  type: z.string(),
});

export const StravaActivitiesSchema = z.array(StravaActivitySchema);

export type StravaActivity = z.infer<typeof StravaActivitySchema>;
