export const PROJECT_TRANSITION_SHARE = {
  image: "project-image-morph",
  tag: "project-chip-morph",
  text: "project-text-morph",
} as const;

export function projectTransitionName(
  slug: string,
  part: "description" | "image" | "tag" | "title",
  tag?: string,
) {
  return tag ? `project-${slug}-${part}-${tag}` : `project-${slug}-${part}`;
}
