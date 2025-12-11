import Image from "next/image";
import { Card } from "@/components/ui/card";
import type { RecentTrack } from "@/lib/schemas/last-fm";
import { Skeleton } from "./ui/skeleton";

interface TrackCardProps {
  latestTrack: RecentTrack["recenttracks"]["track"][0];
}

export function TrackCard({ latestTrack }: TrackCardProps) {
  const bestImage =
    latestTrack.image.find((image) => image.size === "large")?.["#text"] ??
    latestTrack.image.find((image) => image.size === "extralarge")?.["#text"] ??
    latestTrack.image[0]["#text"] ??
    "";

  return (
    <div className="bg-muted space-y-1.5 rounded-[9px] p-1">
      <Card className="rounded-[9px] p-1">
        <div className="flex min-w-0 items-center gap-2">
          <Image
            alt={latestTrack.name}
            className="aspect-square shrink-0 rounded-[8px] object-cover"
            height={48}
            src={bestImage}
            width={48}
          />
          <div className="min-w-0">
            <h3 className="truncate text-sm font-normal">{latestTrack.name}</h3>
            <p className="text-muted-foreground truncate text-sm">
              {latestTrack.artist["#text"]}
            </p>
          </div>
        </div>
      </Card>
      <p className="text-muted-foreground pl-1 text-xs">
        Last played on{" "}
        {latestTrack.date?.["#text"] && (
          <time dateTime={latestTrack.date["#text"]}>
            {new Date(latestTrack.date["#text"]).toLocaleDateString("en-US", {
              day: "numeric",
              month: "short",
            })}
            ,{" "}
            {new Date(latestTrack.date["#text"]).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </time>
        )}
      </p>
    </div>
  );
}

// In track-card.tsx
export function TrackCardSkeleton() {
  return (
    <div className="bg-muted space-y-1.5 rounded-[9px] p-1">
      <Card className="rounded-[9px] p-1">
        <div className="flex min-w-0 items-center gap-2">
          <Skeleton className="h-12 w-12 rounded-[8px]" />
          <div className="min-w-0 space-y-1">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-24" />
          </div>
        </div>
      </Card>
      <Skeleton className="ml-1 h-4 w-48" />
    </div>
  );
}
