import { Vynil01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import type { RecentTrack } from "@/lib/api/schemas/last-fm";
import { Skeleton } from "./ui/skeleton";

const TRACK_DATE_ONLY_FORMATTER = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
});

const TRACK_TIME_ONLY_FORMATTER = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
});

interface TrackCardProps {
  track: RecentTrack;
  index: number;
}

export function TrackCard({ track, index }: TrackCardProps) {
  const bestImage = track.image.reduce<string>((best, image) => {
    if (image.size === "large") return image["#text"] || best;
    if (image.size === "extralarge" && !best) return image["#text"] || best;
    return best || image["#text"] || "";
  }, "");

  const trackDate = track.date?.uts
    ? new Date(Number(track.date.uts) * 1000)
    : null;

  return (
    <article
      className="animate-card-in track-card bg-card ring-foreground/6 hover:ring-foreground/10 flex items-center gap-1.5 rounded-xl px-2.5 py-2 ring-1 transition-shadow duration-200 ease-out sm:gap-3"
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      {bestImage ? (
        <Image
          alt={track.name}
          className="track-art track-art-responsive aspect-square size-9 shrink-0 rounded-lg object-cover sm:size-11 sm:rounded-[10px]"
          height={44}
          src={bestImage}
          width={44}
        />
      ) : (
        <div className="track-art-empty grid size-9 shrink-0 place-items-center rounded-lg sm:size-11 sm:rounded-[10px]">
          <HugeiconsIcon
            className="text-muted-foreground size-4 sm:size-5"
            icon={Vynil01Icon}
          />
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-xs leading-snug sm:text-sm">
          {track.name}
        </span>
        <p className="text-muted-foreground hidden truncate text-xs sm:block">
          {track.artist["#text"]}
          {track.album["#text"] && ` • ${track.album["#text"]}`}
        </p>
        <p className="text-muted-foreground truncate text-[10px] sm:hidden">
          {track.artist["#text"]}
        </p>
      </div>

      {trackDate && (
        <time
          className="text-muted-foreground flex shrink-0 flex-col items-end text-[10px] tabular-nums sm:flex-row sm:gap-1 sm:text-xs"
          dateTime={trackDate.toISOString()}
        >
          <span>{TRACK_DATE_ONLY_FORMATTER.format(trackDate)}</span>
          <span>{TRACK_TIME_ONLY_FORMATTER.format(trackDate)}</span>
        </time>
      )}
    </article>
  );
}

export function TrackCardSkeleton() {
  return (
    <div className="bg-card ring-foreground/6 flex items-center gap-1.5 rounded-xl px-2.5 py-2 ring-1 sm:gap-3">
      <Skeleton className="size-9 rounded-lg sm:size-11 sm:rounded-[10px]" />
      <div className="min-w-0 flex-1 space-y-1">
        <Skeleton className="h-4 w-24 sm:w-32" />
        <Skeleton className="h-3 w-20 sm:w-24" />
      </div>
      <div className="flex shrink-0 flex-col items-end gap-0.5 sm:flex-row sm:gap-1">
        <Skeleton className="h-3 w-10 sm:w-12" />
        <Skeleton className="h-3 w-16 sm:w-20" />
      </div>
    </div>
  );
}
