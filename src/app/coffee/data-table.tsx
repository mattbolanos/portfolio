"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Table>
      <TableHeader className="[&_tr]:border-0">
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow
            className="border-0 hover:bg-transparent"
            key={headerGroup.id}
          >
            {headerGroup.headers.map((header) => (
              <TableHead
                className="text-muted-foreground h-9 px-0 pr-5 text-xs font-normal"
                key={header.id}
              >
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <TableRow className="border-0 hover:bg-transparent" key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell className="px-0 py-2 pr-5" key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow className="border-0 hover:bg-transparent">
            <TableCell
              className="text-muted-foreground h-24 px-0 text-center"
              colSpan={columns.length}
            >
              No coffee logged yet.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
