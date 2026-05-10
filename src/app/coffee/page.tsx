import type { Metadata } from "next";
import { Suspense } from "react";
import { ProjectBreadcrumb } from "@/components/project-breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { CoffeeTable } from "./coffee-table";

export const metadata: Metadata = {
  description: "Matt Bolaños' coffee table",
  title: "Coffee | Matt Bolaños",
};

function CoffeeTableFallback() {
  return <Skeleton className="h-96 w-full" />;
}

export default function CoffeePage() {
  return (
    <div>
      <ProjectBreadcrumb projectName="Coffee" slug="coffee" />
      <div className="space-y-4">
        <h1>Coffee</h1>
        <Suspense fallback={<CoffeeTableFallback />}>
          <CoffeeTable />
        </Suspense>
      </div>
    </div>
  );
}
