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
  projectUrl?: string;
  imageUrl: string;
  images?: ProjectImage[];
}

interface TagLabelOverrides {
  tag: string;
  label: string;
}

export const projects: Project[] = [
  {
    description:
      "CRISPRi seed off-target search app backed by a Python pre-computation pipeline that shards genomic k-mer indexes for fast lookup.",
    githubUrl: "https://github.com/mattbolanos/crispr-seed-finder",

    imageUrl: "crispr-seed-finder/crispr-seed.png",
    longDescription: [
      "I built this for my friend completing a PhD in genetics at Stanford University to check whether a 20 bp CRISPRi guide, or a preloaded Dolcetto guide alias, has PAM-proximal seed matches near annotated transcription start sites in hg38. The app handles guide lookup, sequence validation, and CSV export so researchers can inspect likely off-target hits quickly.",
      "The performance work happens upstream in a Python pre-computation pipeline. It converts large pickle k-mer indexes into gzip-compressed JSON shards grouped by 5-base prefixes for each supported seed length, then publishes those shards to Cloudflare R2. At query time the app only fetches the small set of shard files needed for the guide's seed and reverse complement instead of scanning the full dataset.",
    ],
    name: "CRISPR Seed Finder",
    projectUrl: "https://crispr-seed-finder.vercel.app",
    slug: "crispr-seed-finder",
    tags: ["react", "typescript", "next.js"],
  },
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

const PROJECT_TAG_LABEL_OVERRIDES: TagLabelOverrides[] = [
  { label: "Next.js", tag: "next.js" },
  {
    label: "TypeScript",
    tag: "typescript",
  },
];

export function formatTagLabel(tag: string): string {
  const overrideLabel = PROJECT_TAG_LABEL_OVERRIDES.find(
    (labels) => labels.tag === tag,
  );

  if (overrideLabel) return overrideLabel.label;
  return tag.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
