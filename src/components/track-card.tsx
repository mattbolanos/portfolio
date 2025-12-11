import Image from "next/image";
import { Card } from "@/components/ui/card";
import type { RecentTrack } from "@/lib/schemas/last-fm";
import { Skeleton } from "./ui/skeleton";

interface TrackCardProps {
  latestTrack: RecentTrack["recenttracks"]["track"][0];
}

export function TrackCard({ latestTrack }: TrackCardProps) {
  const bestImage = latestTrack.image.reduce<string>((best, image) => {
    if (image.size === "large") return image["#text"] || best;
    if (image.size === "extralarge" && !best) return image["#text"] || best;
    return best || image["#text"] || "";
  }, "");

  const trackDate = latestTrack.date?.uts
    ? new Date(Number(latestTrack.date.uts) * 1000)
    : null;

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
        {trackDate && (
          <time dateTime={trackDate.toISOString()}>
            {trackDate.toLocaleDateString("en-US", {
              day: "numeric",
              month: "short",
              timeZone: "America/New_York",
            })}
            ,{" "}
            {trackDate.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              timeZone: "America/New_York",
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
