"use client"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel, getSortedRowModel, SortingState,
  useReactTable,
  Table as TenstackTable, RowSelectionState, OnChangeFn
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {Button} from "@/components/ui/button";
import {ChevronDown, ChevronUp} from "lucide-react";
import {PropsWithChildren, useEffect, useMemo, useState} from "react";
import {useSearchParams} from "next/navigation";
import {cn} from "@/lib/utils";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  setTable?: (table: TenstackTable<TData>) => void
  rowSelection?: RowSelectionState
  setRowSelection?: OnChangeFn<RowSelectionState>
}

export function DataTable<TData, TValue>(props: DataTableProps<TData, TValue>) {
  const { columns, data, setTable, rowSelection, setRowSelection } = props;
  const [sorting, setSorting] = useState<SortingState>([])

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
      rowSelection: rowSelection ?? {}
    },
  })

  useEffect(() => {
    setTable && setTable(table)
  }, [setTable, table])

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              return (
                <TableHead key={header.id} className="last-of-type:text-end items-center h-full">
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                </TableHead>
              )
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={row?.getIsSelected() && "selected"}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}
                           width={
                             !Number.isNaN(cell.column.getSize())
                               ? cell.column.getSize()
                               : undefined
                           }
                           className="last-of-type:text-end items-center h-full">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={columns.length} className="h-24 text-center">
              No results.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}

interface IDataTableSortProps {
  property: string,
  setSorting: (key: string, direction: string) => void
}

export const DataTableSort = ({children, property, setSorting}: PropsWithChildren<IDataTableSortProps>) => {
  const query = useSearchParams()

  const selectedDirection = useMemo(() => {
    if (!query.get('sort')) {
      return undefined
    }
    const sortParts = query.get('sort')?.split(',') ?? []
    const selectedProperty = sortParts[0]?.replace(/[\[\]"]+/g, '')
    const direction = sortParts[1][0]

    if (selectedProperty === property) {
      return direction
    }
    return undefined
  }, [query, property])

  return <div className="flex gap-2 items-center">
    <p>{children}</p>
    <div className="flex flex-col">
      <Button
        variant="ghost"
        className={cn("h-5 w-5 p-0 rounded-b-none", selectedDirection === '1' && 'text-link bg-muted rounded-md')}
        onClick={() => setSorting(property, '1')}
      >
        <ChevronUp className="h-4 w-4"/>
      </Button>
      <Button
        variant="ghost"
        className={cn("h-5 w-5 p-0 rounded-t-none", selectedDirection === '0' && 'text-link bg-muted rounded-md')}
        onClick={() => setSorting(property, '0')}
      >
        <ChevronDown className="h-4 w-4"/>
      </Button>
    </div>
  </div>
}
