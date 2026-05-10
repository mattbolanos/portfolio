import { cacheLife } from "next/cache";
import type { CoffeeTablePage } from "@/lib/api/notion";
import { getCoffeeTablePages } from "@/lib/api/notion";
import { type CoffeeEntry, columns } from "./columns";
import { DataTable } from "./data-table";

const COFFEE_TABLE_REVALIDATE_SECONDS = 60 * 60;

async function getCachedCoffeeTablePages() {
  "use cache";

  cacheLife({ revalidate: COFFEE_TABLE_REVALIDATE_SECONDS });
  return getCoffeeTablePages();
}

function getTitle(page: CoffeeTablePage) {
  const cup = page.properties.Cup;

  if (cup?.type !== "title") {
    return "Cup";
  }

  return (
    cup.title
      .map((text) => text.plain_text)
      .join("")
      .trim() || "Cup"
  );
}

function getNumber(page: CoffeeTablePage, propertyName: string) {
  const property = page.properties[propertyName];

  if (property?.type !== "number") {
    return null;
  }

  return property.number;
}

function getFormulaNumber(page: CoffeeTablePage, propertyName: string) {
  const property = page.properties[propertyName];

  if (property?.type !== "formula" || property.formula.type !== "number") {
    return null;
  }

  return property.formula.number;
}

function getCheckbox(page: CoffeeTablePage, propertyName: string) {
  const property = page.properties[propertyName];

  if (property?.type !== "checkbox") {
    return false;
  }

  return property.checkbox;
}

function getCreated(page: CoffeeTablePage) {
  const created = page.properties.Created;

  if (created?.type === "created_time") {
    return created.created_time;
  }

  return page.created_time;
}

function toCoffeeEntry(page: CoffeeTablePage): CoffeeEntry {
  const cupNumber = getNumber(page, "Cup # (day)");

  return {
    coffeeCups: getNumber(page, "Coffee (cups)"),
    createdAt: getCreated(page),
    cup: cupNumber ? `Cup ${cupNumber}` : getTitle(page),
    cupNumber,
    fresh: getCheckbox(page, "Fresh?"),
    frothToPourSeconds: getNumber(page, "Froth→Pour (sec)"),
    id: page.id,
    milkCups: getNumber(page, "Milk (cups)"),
    rating: getNumber(page, "Rating (0–5)"),
    ratio: getFormulaNumber(page, "Coffee:Milk ratio"),
  };
}

export async function CoffeeTable() {
  const data = await getCachedCoffeeTablePages();

  if (!data.ok) {
    return <p className="text-muted-foreground text-sm">{data.error}</p>;
  }

  return <DataTable columns={columns} data={data.pages.map(toCoffeeEntry)} />;
}
