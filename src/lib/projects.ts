interface ProjectImage {
  src: string;
  width: number;
  height?: number;
}

export interface Project {
  name: string;
  slug: string;
  description: string;
  longDescription: string[];
  tags: string[];
  githubUrl: string;
  imageUrl: string;
  images: ProjectImage[];
}

export const projects: Project[] = [
  {
    description:
      "iOS widget that displays a GitHub-style heatmap of your Strava activities.",
    githubUrl: "https://github.com/mattbolanos/stratiles",
    images: [
      { height: 1304, src: "/projects/stratiles/widget.png", width: 600 },
      { height: 1304, src: "/projects/stratiles/preview-1.png", width: 600 },
      { height: 1303, src: "/projects/stratiles/preview-2.png", width: 600 },
    ],
    imageUrl: "stratiles/stratiles.png",
    longDescription: [
      "Inspired by GitHub's contribution graphs, I built this iOS app to visualize my Strava activity consistency as a widget on my iPhone. The project uses SwiftUI and WidgetKit, with a backend powered by Cloudflare Workers to manage API authentication and data caching.",
      "The companion app offers fun insights, including visualizations of activity patterns by time and day.  Users can fully customize their experience by filtering which activity types are included or excluded from the heatmaps.",
    ],
    name: "Stratiles",
    slug: "stratiles",
    tags: ["swift", "cloudflare-workers"],
  },
];

export function formatTagLabel(tag: string): string {
  return tag.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
