import Image from "next/image";
import type { ReactNode } from "react";
import type { Project, ProjectImage } from "@/lib/projects";

export function ProjectMedia({ project }: { project: Project }) {
  if (project.images.length === 0) {
    return null;
  }

  const landscapeImages = project.images.filter(isLandscapeImage);
  const portraitImages = project.images.filter(
    (image) => !isLandscapeImage(image),
  );

  return (
    <section className="space-y-3">
      <h2>Media</h2>
      {landscapeImages.length > 0 ? (
        <div className="space-y-3">
          {landscapeImages.map((image) => (
            <MediaFrame key={image.src}>
              <Image
                alt={`${project.name} screenshot`}
                className="h-auto w-full"
                height={image.height ?? image.width}
                loading="eager"
                src={image.src}
                width={image.width}
              />
            </MediaFrame>
          ))}
        </div>
      ) : null}
      {portraitImages.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {portraitImages.map((image) => (
            <MediaFrame key={image.src}>
              <Image
                alt={`${project.name} screenshot`}
                className="h-auto w-full"
                height={image.height ?? image.width}
                src={image.src}
                width={image.width}
              />
            </MediaFrame>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function isLandscapeImage(image: ProjectImage) {
  const height = image.height ?? image.width;
  return image.width >= height;
}

function MediaFrame({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl ring-1 ring-black/5 dark:ring-white/10">
      {children}
    </div>
  );
}
