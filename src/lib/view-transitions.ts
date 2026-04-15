function normalizeViewTransitionSegment(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getProjectTitleViewTransitionName(slug: string) {
  return `project-title-${normalizeViewTransitionSegment(slug)}`;
}

export function getProjectDescriptionViewTransitionName(slug: string) {
  return `project-description-${normalizeViewTransitionSegment(slug)}`;
}

export function getProjectImageViewTransitionName(slug: string) {
  return `project-image-${normalizeViewTransitionSegment(slug)}`;
}

export function getProjectTagViewTransitionName(slug: string, tag: string) {
  return `project-tag-${normalizeViewTransitionSegment(slug)}-${normalizeViewTransitionSegment(tag)}`;
}
