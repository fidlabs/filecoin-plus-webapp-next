"use client";

import { OverlayLoader } from "@/components/overlay-loader";
import { SortingButton } from "@/components/sorting-button";
import { StringShortener } from "@/components/string-shortener";
import { Card, CardFooter } from "@/components/ui/card";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Paginator, PaginatorProps } from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { QueryKey } from "@/lib/constants";
import { useDelayedFlag } from "@/lib/hooks/use-delayed-flag";
import { calculateDateFromHeight } from "@/lib/utils";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  OnChangeFn,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { filesize } from "filesize";
import { CopyIcon, InfoIcon } from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo, useState, type ComponentProps } from "react";
import useSWR from "swr";
import {
  fetchAllocators,
  FetchAllocatorsParameters,
  FetchAllocatorsReturnType,
} from "../allocators-data";

type CardProps = ComponentProps<typeof Card>;
export interface MetaallocatorsListWidgetProps
  extends Omit<CardProps, "children"> {
  defaultParameters?: FetchAllocatorsParameters;
}

type Allocator = FetchAllocatorsReturnType["data"][number];

const columns: ColumnDef<Allocator>[] = [
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
    accessorKey: "allocatorsUsingMetaallocator",
    header: "Allocators Count",
    cell: (info) => {
      const value = info.getValue();
      return Array.isArray(value) ? value.length : "N/A";
    },
    enableSorting: false,
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
    cell: (info) => filesize(info.getValue() as string, { standard: "iec" }),
  },
  {
    accessorKey: "remainingDatacap",
    header: "Used DataCap",
    cell: (info) => filesize(info.getValue() as string, { standard: "iec" }),
  },
  {
    accessorKey: "initialAllowance",
    header: "Total DataCap Received",
    cell: ({ row }) => {
      const initialAllowance = row.getValue("initialAllowance") as string;
      const allowanceArray = row.original.allowanceArray;
      return (
        <div className="whitespace-nowrap flex gap-1 items-center">
          {filesize(initialAllowance, { standard: "iec" })}
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
                        {filesize(allowance.allowance, { standard: "iec" })}
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

const pageSizeOptions = [10, 25, 50];

export function MetaallocatorsListWidget({
  defaultParameters = {},
  ...rest
}: MetaallocatorsListWidgetProps) {
  const [parameters, setParameters] = useState(defaultParameters);
  const { data, isLoading } = useSWR(
    [QueryKey.ALLOCATORS_LIST, parameters],
    ([, fetchParameters]) => fetchAllocators(fetchParameters),
    {
      keepPreviousData: true,
      revalidateOnMount: false,
    }
  );
  const isLongLoading = useDelayedFlag(isLoading, 1000);

  const sortingState = useMemo<SortingState>(() => {
    if (!parameters.sort || !parameters.order) {
      return [];
    }

    return [
      {
        id: parameters.sort,
        desc: parameters.order === "desc",
      },
    ];
  }, [parameters.sort, parameters.order]);

  const handleSort = useCallback<OnChangeFn<SortingState>>(
    (updaterOrValue) => {
      const nextSortingState =
        typeof updaterOrValue === "function"
          ? updaterOrValue(sortingState)
          : updaterOrValue;
      const columnSort = nextSortingState[0];

      const sortingParameters: Pick<
        FetchAllocatorsParameters,
        "sort" | "order"
      > = columnSort
        ? {
            sort: columnSort.id,
            order: columnSort.desc ? "desc" : "asc",
          }
        : {
            sort: undefined,
            order: undefined,
          };

      setParameters((currentParameters) => ({
        ...currentParameters,
        ...sortingParameters,
      }));
    },
    [sortingState]
  );

  const handlePageChange = useCallback<PaginatorProps["onPageChange"]>(
    (page) => {
      setParameters((currentParameters) => ({
        ...currentParameters,
        page,
      }));
    },
    []
  );

  const handlePageSizeChange = useCallback<
    NonNullable<PaginatorProps["onPageSizeChange"]>
  >((limit) => {
    setParameters((currentParameters) => ({
      ...currentParameters,
      limit,
    }));
  }, []);

  const table = useReactTable({
    data: data?.data ?? [],
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
    <Card {...rest}>
      <div className="px-4 pt-6 mb-2 gap-4 flex flex-wrap items-center justify-between">
        <div>
          <h2 className="text-lg font-medium">Metaallocators List</h2>
          <p className="text-xs text-muted-foreground">
            Select Metaallocator to see list of allocators under it.
          </p>
        </div>
      </div>

      <div className="relative pb-6">
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
        <OverlayLoader show={!data || isLongLoading} />
      </div>

      {(data?.count ?? 0) > 10 && (
        <CardFooter className="border-t w-full p-3">
          <Paginator
            page={parameters.page ?? 1}
            pageSize={parameters.limit ?? pageSizeOptions[0]}
            pageSizeOptions={pageSizeOptions}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            total={data?.count ?? 0}
          />
        </CardFooter>
      )}
    </Card>
  );
}
