export interface Project {
  name: string;
  slug: string;
  description: string;
  longDescription: string[];
  tags: string[];
  githubUrl?: string;
  imageUrl: string;
  imgs: string[];
}

export const projects: Project[] = [
  {
    description:
      "iOS widget that displays a GitHub-style heatmap of your Strava activities.",
    githubUrl: "https://github.com/mattbolanos/stratiles",
    imageUrl: "stratiles/stratiles.png",
    imgs: [
      "/projects/stratiles/widget.png",
      "/projects/stratiles/preview-1.png",
      "/projects/stratiles/preview-2.png",
    ],
    longDescription: [
      "Stratiles is an iOS home screen widget that visualizes your Strava activity data as a GitHub-style contribution heatmap. It gives you a quick, at-a-glance view of your training consistency directly from your home screen — no need to open any app.",
      "The widget fetches activity data through a Cloudflare Worker that acts as a lightweight proxy to the Strava API, handling OAuth token refresh and caching to keep things fast and within rate limits. The widget itself is built in SwiftUI using WidgetKit.",
    ],
    name: "Stratiles",
    slug: "stratiles",
    tags: ["swift", "cloudflare-workers"],
  },
];

export function formatTagLabel(tag: string): string {
  return tag.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
