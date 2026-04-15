import { Link } from "next-view-transitions";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getProjectTitleViewTransitionName } from "@/lib/view-transitions";

interface ProjectBreadcrumbProps {
  projectName: string;
  slug: string;
}

export function ProjectBreadcrumb({
  projectName,
  slug,
}: ProjectBreadcrumbProps) {
  return (
    <Breadcrumb className="mb-6">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink
            render={<Link className="text-link" href="/" prefetch />}
          >
            Matt Bolaños
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage
            className="inline-block"
            style={{
              viewTransitionName: getProjectTitleViewTransitionName(slug),
            }}
          >
            {projectName}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
