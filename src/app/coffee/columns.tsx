"use client";

import type { ColumnDef } from "@tanstack/react-table";

export type CoffeeEntry = {
  coffeeCups: number | null;
  createdAt: string;
  cup: string;
  cupNumber: number | null;
  fresh: boolean;
  frothToPourSeconds: number | null;
  id: string;
  milkCups: number | null;
  rating: number | null;
  ratio: number | null;
};

const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  month: "short",
});

function formatNumber(value: number | null) {
  return value === null ? "—" : numberFormatter.format(value);
}

function formatRatio(row: CoffeeEntry) {
  if (row.coffeeCups === null || row.milkCups === null || row.ratio === null) {
    return "—";
  }

  return numberFormatter.format(row.ratio);
}

export const columns: ColumnDef<CoffeeEntry>[] = [
  {
    accessorKey: "cup",
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("cup")}</span>
    ),
    header: "Cup",
  },
  {
    accessorKey: "createdAt",
    cell: ({ row }) =>
      dateFormatter.format(new Date(row.getValue("createdAt"))),
    header: "Created",
  },
  {
    accessorKey: "coffeeCups",
    cell: ({ row }) => (
      <div className="text-right">
        {formatNumber(row.getValue("coffeeCups"))}
      </div>
    ),
    header: () => <div className="text-right">Coffee</div>,
  },
  {
    accessorKey: "milkCups",
    cell: ({ row }) => (
      <div className="text-right">{formatNumber(row.getValue("milkCups"))}</div>
    ),
    header: () => <div className="text-right">Milk</div>,
  },
  {
    accessorKey: "ratio",
    cell: ({ row }) => (
      <div className="text-right">{formatRatio(row.original)}</div>
    ),
    header: () => <div className="text-right">Ratio</div>,
  },
  {
    accessorKey: "frothToPourSeconds",
    cell: ({ row }) => (
      <div className="text-right">
        {row.original.frothToPourSeconds === null
          ? "—"
          : `${numberFormatter.format(row.original.frothToPourSeconds)}s`}
      </div>
    ),
    header: () => <div className="text-right">Froth→Pour</div>,
  },
  {
    accessorKey: "fresh",
    cell: ({ row }) => (row.getValue("fresh") ? "Yes" : "—"),
    header: "Fresh",
  },
  {
    accessorKey: "rating",
    cell: ({ row }) => (
      <div className="text-right">
        {row.original.rating === null
          ? "—"
          : `${numberFormatter.format(row.original.rating)} / 5`}
      </div>
    ),
    header: () => <div className="text-right">Rating</div>,
  },
];
