import { z } from "zod";

export const GithubRepoSchema = z.object({
  pushed_at: z.iso.datetime({ offset: true }),
});

export type GithubRepo = z.infer<typeof GithubRepoSchema>;
