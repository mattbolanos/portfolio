export function getProjectTitleViewTransitionName(slug: string) {
  return `project-title-${slug}`;
}

export function getProjectImageViewTransitionName(slug: string) {
  return `project-image-${slug}`;
}

export function getProjectDescriptionViewTransitionName(slug: string) {
  return `project-description-${slug}`;
}

export function getProjectTagViewTransitionName(slug: string, tag: string) {
  return `project-tag-${slug}-${tag}`;
}
