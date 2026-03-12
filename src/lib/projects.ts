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
      { height: 1260, src: "/projects/stratiles/app-1.png", width: 581 },
      { height: 1260, src: "/projects/stratiles/phone-1.png", width: 581 },
      { height: 1260, src: "/projects/stratiles/app-2.png", width: 581 },
      { height: 1260, src: "/projects/stratiles/app-3.png", width: 581 },
      { height: 1260, src: "/projects/stratiles/app-4.png", width: 581 },
      { height: 1260, src: "/projects/stratiles/phone-2.png", width: 581 },
    ],
    imageUrl: "stratiles/stratiles.png",
    longDescription: [
      "Inspired by GitHub's contribution graphs, I built this iOS app to visualize my Strava activity consistency as a widget on my iPhone. The project uses SwiftUI and WidgetKit, with a backend powered by Cloudflare Workers to manage authentication and data caching.",
      "The companion app offers fun insights, including visualizations of activity patterns by time and day.  Users can customize their charts by filtering which activity types are included or excluded from the heatmaps.",
    ],
    name: "Stratiles",
    slug: "stratiles",
    tags: ["swift", "cloudflare-workers"],
  },
];

export function formatTagLabel(tag: string): string {
  return tag.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
