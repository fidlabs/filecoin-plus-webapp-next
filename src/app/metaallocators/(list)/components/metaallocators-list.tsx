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
  metaallocatorsReponse: IAllocatorsResponse;
}

const columns: ColumnDef<IAllocator>[] = [
  {
    accessorKey: "addressId",
    header: "Metaallocator ID",
    cell(info) {
      const addressId = info.getValue();

      if (typeof addressId !== "string") {
        return null;
      }

      return (
        <Link
          className="table-link"
          href={`/metaallocators/${addressId}/allocators`}
        >
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
        <Link
          className="table-link"
          href={`/metaallocators/${addressId}/allocators`}
        >
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
    accessorKey: "allowance",
    header: "DataCap Available",
    cell: (info) => convertBytesToIEC(info.getValue() as string),
  },
  {
    accessorKey: "remainingDatacap",
    header: "Used DataCap",
    cell: (info) => convertBytesToIEC(info.getValue() as string),
  },
  {
    accessorKey: "initialAllowance",
    header: "Total DataCap Received",
    cell: ({ row }) => {
      const initialAllowance = row.getValue("initialAllowance") as string;
      const allowanceArray = row.original.allowanceArray;
      return (
        <div className="whitespace-nowrap flex gap-1 items-center">
          {convertBytesToIEC(initialAllowance)}
          {!!allowanceArray?.length && (
            <HoverCard openDelay={100} closeDelay={50}>
              <HoverCardTrigger>
                <InfoIcon
                  size={15}
                  className="text-muted-foreground cursor-help"
                />
              </HoverCardTrigger>
              <HoverCardContent className="w-64">
                {allowanceArray.map((allowance, index) => {
                  return (
                    <div key={index} className="grid grid-cols-7 gap-2">
                      <div className="col-span-2 text-right">
                        {convertBytesToIEC(allowance.allowance)}
                      </div>
                      <div className="col-span-5 text-sm text-muted-foreground">
                        ({calculateDateFromHeight(+allowance.height)})
                      </div>
                    </div>
                  );
                })}
              </HoverCardContent>
            </HoverCard>
          )}
        </div>
      );
    },
  },
];

export function MetaallocatorsList({
  metaallocatorsReponse,
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

  const table = useReactTable({
    data: metaallocatorsReponse.data,
    columns,
    manualSorting: true,
    state: {
      sorting: sortingState,
    },
    onSortingChange: handleSort,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

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
          {table.getRowModel().rows.map((row) => (
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
      {metaallocatorsReponse.count > 10 && (
        <CardFooter className="border-t w-full p-3">
          <Paginator
            page={filters.page ? parseInt(filters.page, 10) : 1}
            perPage={filters.limit ? parseInt(filters.limit, 10) : 10}
            total={metaallocatorsReponse.count}
            paginationSteps={["10", "15", "25"]}
            patchParams={updateFilters}
          />
        </CardFooter>
      )}
    </>
  );
}
