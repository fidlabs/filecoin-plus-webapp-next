"use client";

import { SortingButton } from "@/components/sorting-button";
import { StringShortener } from "@/components/string-shortener";
import { CardFooter } from "@/components/ui/card";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Paginator } from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSearchParamsFilters } from "@/lib/hooks/use-search-params-filters";
import {
  type IAllocator,
  type IAllocatorsResponse,
} from "@/lib/interfaces/dmob/allocator.interface";
import { calculateDateFromHeight, convertBytesToIEC } from "@/lib/utils";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  OnChangeFn,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { CopyIcon, InfoIcon } from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo } from "react";

export interface MetaallocatorsListProps {
  allocatorsReponse: IAllocatorsResponse;
}

const columns: ColumnDef<IAllocator>[] = [
  {
    accessorKey: "addressId",
    header: "Allocator ID",
    cell(info) {
      const addressId = info.getValue();

      if (typeof addressId !== "string") {
        return null;
      }

      return (
        <Link className="table-link" href={`/allocators/${addressId}`}>
          {addressId}
        </Link>
      );
    },
  },
  {
    accessorFn(row) {
      return [row.name, row.addressId];
    },
    id: "name",
    header: "Name",
    cell(info) {
      const [name, addressId] = info.getValue() as [
        string | null | undefined,
        string,
      ];

      return (
        <Link className="table-link" href={`/allocators/${addressId}`}>
          <StringShortener value={name ?? "N/A"} maxLength={20} />
        </Link>
      );
    },
  },
  {
    accessorKey: "orgName",
    header: "Organization Name",
    cell(info) {
      const orgName = info.getValue();
      return (
        <StringShortener
          value={typeof orgName === "string" ? orgName : "N/A"}
          maxLength={20}
        />
      );
    },
  },
  {
    accessorKey: "verifiedClientsCount",
    header: "Verified Clients",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "address",
    header: "Address",
    cell(info) {
      const address = info.getValue() as string;
      const addressShort = `${address.slice(0, 4)}...${address.slice(-4)}`;
      return (
        <div className="flex gap-2 items-center">
          <p className="whitespace-nowrap">{addressShort}</p>
          <button onClick={() => navigator.clipboard.writeText(address)}>
            <CopyIcon size={15} className="text-muted-foreground" />
          </button>
        </div>
      );
    },
  },
  {
    accessorKey: "createdAtHeight",
    header: "Create Date",
    cell(info) {
      const createdAtHeight = info.getValue() as number;
      return (
        <div className="whitespace-nowrap flex gap-1 items-center">
          {calculateDateFromHeight(createdAtHeight)}
          <HoverCard openDelay={100} closeDelay={50}>
            <HoverCardTrigger>
              <InfoIcon
                size={15}
                className="text-muted-foreground cursor-help"
              />
            </HoverCardTrigger>
            <HoverCardContent className="w-32">
              <p>Block height</p>
              <p>{createdAtHeight}</p>
            </HoverCardContent>
          </HoverCard>
        </div>
      );
    },
  },
  {
    accessorKey: "receivedDatacapFromMetaallocator",
    header: "DC Received from Metaallocator",
    cell: (info) => {
      const datacapReceivedFromMetaallocator = info.getValue() as string | null;
      return convertBytesToIEC(datacapReceivedFromMetaallocator ?? 0);
    },
  },
];

export function MetaallocatorAllocatorsList({
  allocatorsReponse,
}: MetaallocatorsListProps) {
  const { filters, updateFilters } = useSearchParamsFilters();

  const sortingState = useMemo<SortingState>(() => {
    if (
      !filters.sort ||
      (filters.order !== "asc" && filters.order !== "desc")
    ) {
      return [];
    }

    return [
      {
        desc: filters.order === "desc",
        id: filters.sort,
      },
    ];
  }, [filters.sort, filters.order]);

  const handleSort = useCallback<OnChangeFn<SortingState>>(
    (updaterOrValue) => {
      const nextSortingState =
        typeof updaterOrValue === "function"
          ? updaterOrValue(sortingState)
          : updaterOrValue;
      const columnSort = nextSortingState[0];

      updateFilters(
        columnSort
          ? {
              sort: columnSort.id,
              order: columnSort.desc ? "desc" : "asc",
            }
          : {
              sort: undefined,
              order: undefined,
            }
      );
    },
    [sortingState, updateFilters]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      updateFilters({
        page: page.toString(),
      });
    },
    [updateFilters]
  );

  const handlePageSizeChange = useCallback(
    (pageSize: number) => {
      updateFilters({
        limit: pageSize.toString(),
        page: "1",
      });
    },
    [updateFilters]
  );

  const table = useReactTable({
    data: allocatorsReponse.data,
    columns,
    manualSorting: true,
    state: {
      sorting: sortingState,
    },
    onSortingChange: handleSort,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const rows = table.getRowModel().rows;

  return (
    <>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const headerContent = flexRender(
                  header.column.columnDef.header,
                  header.getContext()
                );

                const sortable = header.column.getCanSort();
                const sortDirection = header.column.getIsSorted();

                return (
                  <TableHead key={header.id}>
                    {sortable ? (
                      <SortingButton
                        sorted={typeof sortDirection === "string"}
                        descending={sortDirection === "desc"}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {headerContent}
                      </SortingButton>
                    ) : (
                      headerContent
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {rows.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={table.getVisibleFlatColumns().length}
                className="text-center"
              >
                Nothing to show.
              </TableCell>
            </TableRow>
          )}

          {rows.length > 0 &&
            rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
        </TableBody>
      </Table>

      {allocatorsReponse.count > 10 && (
        <CardFooter className="border-t w-full p-3">
          <Paginator
            page={filters.page ? parseInt(filters.page, 10) : 1}
            pageSize={filters.limit ? parseInt(filters.limit, 10) : 10}
            total={allocatorsReponse.count}
            pageSizeOptions={[10, 15, 25]}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </CardFooter>
      )}
    </>
  );
}
