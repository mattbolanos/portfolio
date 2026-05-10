import type { Metadata } from "next";
import { Header } from "@/components/header";
import { CoffeeTable } from "./coffee-table";

export const metadata: Metadata = {
  description: "Coffee notes from Matt Bolaños",
  title: "Coffee | Matt Bolaños",
};

export default function CoffeePage() {
  return (
    <div>
      <Header />
      <div className="space-y-3">
        <h2>Coffee</h2>
        <CoffeeTable />
      </div>
    </div>
  );
}
