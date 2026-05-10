import { unstable_cache } from "next/cache";
import {
  getCoffeePages,
  NOTION_CACHE_REVALIDATE_SECONDS,
} from "@/lib/api/notion";

const getCachedCoffeePages = unstable_cache(
  () => getCoffeePages(),
  ["coffee-notion-pages"],
  { revalidate: NOTION_CACHE_REVALIDATE_SECONDS },
);

export async function CoffeeTable() {
  const coffeePages = await getCachedCoffeePages();

  if (!coffeePages) {
    return (
      <pre className="bg-card text-muted-foreground overflow-x-auto rounded-lg p-4 text-sm">
        Unable to load coffee data.
      </pre>
    );
  }

  return (
    <pre className="bg-card overflow-x-auto rounded-lg p-4 text-sm">
      {JSON.stringify(coffeePages, null, 2)}
    </pre>
  );
}
