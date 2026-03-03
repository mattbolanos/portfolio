import { z } from "zod";

export const GithubRepoSchema = z.object({
  pushed_at: z.iso.datetime({ offset: true }),
});
