"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  OnChangeFn,
  RowSelectionState,
  SortingState,
  Table as TenstackTable,
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
import { PropsWithChildren, useEffect, useState } from "react";

type DataTableProps<TData, TValue> = PropsWithChildren<{
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  setTable?: (table: TenstackTable<TData>) => void;
  rowSelection?: RowSelectionState;
  setRowSelection?: OnChangeFn<RowSelectionState>;
}>;

export function DataTable<TData, TValue>(props: DataTableProps<TData, TValue>) {
  const { children, columns, data, setTable, rowSelection, setRowSelection } =
    props;
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getSortedRowModel: getSortedRowModel(),
    defaultColumn: {
      size: Number.NaN,
    },
    state: {
      sorting,
      rowSelection: rowSelection ?? {},
    },
  });

  useEffect(() => {
    setTable && setTable(table);
  }, [setTable, table]);

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              return (
                <TableHead
                  key={header.id}
                  className="last-of-type:text-end items-center h-full"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows?.length ? (
          <>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row?.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    width={
                      !Number.isNaN(cell.column.getSize())
                        ? cell.column.getSize()
                        : undefined
                    }
                    className="last-of-type:text-end items-center h-full"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            {children}
          </>
        ) : (
          <TableRow>
            <TableCell colSpan={columns.length} className="h-24 text-center">
              No results.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
