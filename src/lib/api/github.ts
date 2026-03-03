import { cacheLife } from "next/cache";
import { GithubRepoSchema } from "./schemas/github";

function parseGithubRepo(url: string): string | null {
  const match = url.match(/github\.com\/([^/]+\/[^/]+)/);
  return match?.[1] ?? null;
}

export async function getRepoPushedAt(
  githubUrl: string,
): Promise<string | null> {
  "use cache";
  cacheLife("hours");

  const repo = parseGithubRepo(githubUrl);
  if (!repo) return null;

  const res = await fetch(`https://api.github.com/repos/${repo}`, {
    headers: { Accept: "application/vnd.github+json" },
  });

  if (!res.ok) return null;

  const parsed = GithubRepoSchema.safeParse(await res.json());
  if (!parsed.success) return null;

  return parsed.data.pushed_at;
}
