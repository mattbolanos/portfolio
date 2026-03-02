export interface Project {
  name: string;
  slug: string;
  description: string;
  longDescription: string;
  tags: string[];
  url: string;
  imageUrl: string;
  screenshots: string[];
}

export const projects: Project[] = [
  {
    description:
      "iOS widget that displays a GitHub-style heatmap of your Strava activities.",
    imageUrl: "stratiles.png",
    longDescription:
      "Stratiles is an iOS home screen widget that visualizes your Strava activity data as a GitHub-style contribution heatmap. It gives you a quick, at-a-glance view of your training consistency directly from your home screen — no need to open any app.\n\nThe widget fetches activity data through a Cloudflare Worker that acts as a lightweight proxy to the Strava API, handling OAuth token refresh and caching to keep things fast and within rate limits. The widget itself is built in SwiftUI using WidgetKit, with configurable color themes and date ranges.",
    name: "Stratiles",
    screenshots: [
      "/projects/stratiles-screenshot-1.png",
      "/projects/stratiles-screenshot-2.png",
      "/projects/stratiles-screenshot-3.png",
    ],
    slug: "stratiles",
    tags: ["swift", "cloudflare-workers"],
    url: "https://github.com/mattbolanos/stratiles",
  },
];

export function formatTagLabel(tag: string): string {
  return tag.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
