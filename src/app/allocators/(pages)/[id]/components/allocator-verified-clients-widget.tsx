"use client";

import {
  fetchAllocatorVerifiedClients,
  type FetchAllocatorVerifiedClientsParameters,
  type FetchAllocatorVerifiedClientsReturnType,
} from "@/app/allocators/allocators-data";
import {
  DataTableSort,
  DataTableSortProps,
} from "@/components/data-table-sort";
import { OverlayLoader } from "@/components/overlay-loader";
import { Card, CardFooter } from "@/components/ui/card";
import { ChartLoader } from "@/components/ui/chart-loader";
import { DataTable } from "@/components/ui/data-table";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Paginator } from "@/components/ui/pagination";
import { ClientDetailsPageSectionId, QueryKey } from "@/lib/constants";
import { useDelayedFlag } from "@/lib/hooks/use-delayed-flag";
import { createColumnHelper } from "@tanstack/react-table";
import { filesize } from "filesize";
import Link from "next/link";
import {
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
  useQueryState,
  useQueryStates,
} from "nuqs";
import {
  type ComponentProps,
  type PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import useSWR from "swr";

type VerifiedClient = FetchAllocatorVerifiedClientsReturnType["data"][number];
type CardProps = ComponentProps<typeof Card>;
export interface AllocatorVerifiedClientsWidgetProps
  extends Omit<CardProps, "children"> {
  allocatorId: string;
}

type SortableTableHeadProps = PropsWithChildren<{
  sortKey: string;
}>;

const pageSizeOptions = [10, 15, 25];
const pageKey = "clp";
const pageSizeKey = "clps";
const sortFieldKey = "cls";
const sortDirectionKey = "clsd";

const columnHelper = createColumnHelper<VerifiedClient>();
const columns = [
  columnHelper.accessor("addressId", {
    header() {
      return (
        <SortableTableHead sortKey="addressId">
          Verfied Client ID
        </SortableTableHead>
      );
    },
    cell({ getValue }) {
      const addressId = getValue();

      return (
        <Link className="table-link" href={`/clients/${addressId}`}>
          {addressId}
        </Link>
      );
    },
  }),
  columnHelper.accessor("name", {
    header() {
      return <SortableTableHead sortKey="name">Client Name</SortableTableHead>;
    },
    cell({ getValue, row }) {
      const fullName =
        getValue() ?? row.original.orgName ?? row.original.addressId;
      const name =
        fullName.length > 20 ? fullName.slice(0, 20) + "..." : fullName;
      const linkElement = (
        <Link
          className="table-link"
          href={`/clients/${row.original.addressId}`}
        >
          {name}
        </Link>
      );

      return fullName.length > 20 ? (
        <HoverCard openDelay={100} closeDelay={50}>
          <HoverCardTrigger asChild>{linkElement}</HoverCardTrigger>
          <HoverCardContent className="w-80">{fullName}</HoverCardContent>
        </HoverCard>
      ) : (
        linkElement
      );
    },
  }),
  columnHelper.accessor("usedDatacap", {
    header() {
      return (
        <SortableTableHead sortKey="usedDatacap">Received DC</SortableTableHead>
      );
    },
    cell({ getValue, row }) {
      return (
        <Link
          className="table-link"
          href={`/clients/${row.original.addressId}#${ClientDetailsPageSectionId.ALLOCATIONS}`}
        >
          {filesize(getValue(), { standard: "iec" })}
        </Link>
      );
    },
  }),
  columnHelper.accessor("remainingDatacap", {
    header() {
      return (
        <SortableTableHead sortKey="remainingDatacap">
          Remaining DC
        </SortableTableHead>
      );
    },
    cell({ getValue }) {
      return filesize(getValue(), { standard: "iec" });
    },
  }),
  columnHelper.accessor("usedDatacapChange", {
    header() {
      return (
        <SortableTableHead sortKey="usedDatacapChange">
          DC Used in Last 2 Weeks
        </SortableTableHead>
      );
    },
    cell({ getValue }) {
      return filesize(getValue(), { standard: "iec" });
    },
  }),
];

function useSorting() {
  return useQueryStates({
    [sortFieldKey]: parseAsString.withDefault("addressId"),
    [sortDirectionKey]: parseAsStringEnum(["asc", "desc"]).withDefault("asc"),
  });
}

function SortableTableHead({ children, sortKey }: SortableTableHeadProps) {
  const [sorting, setSorting] = useSorting();

  const handleSort = useCallback<NonNullable<DataTableSortProps["onSort"]>>(
    (direction) => {
      setSorting({
        [sortFieldKey]: sortKey,
        [sortDirectionKey]: direction,
      });
    },
    [setSorting, sortKey]
  );

  return (
    <DataTableSort
      direction={
        sorting[sortFieldKey] === sortKey
          ? sorting[sortDirectionKey]
          : undefined
      }
      onSort={handleSort}
    >
      {children}
    </DataTableSort>
  );
}

export function AllocatorVerifiedClientsWidget({
  allocatorId,
  ...rest
}: AllocatorVerifiedClientsWidgetProps) {
  const [page, setPage] = useQueryState(pageKey, parseAsInteger.withDefault(1));
  const [limit, setLimit] = useQueryState(
    pageSizeKey,
    parseAsInteger.withDefault(10)
  );
  const [sorting] = useSorting();

  const parameters = useMemo<FetchAllocatorVerifiedClientsParameters>(() => {
    return {
      allocatorId,
      page,
      limit,
      sort: sorting[sortFieldKey],
      order: sorting[sortDirectionKey],
    };
  }, [allocatorId, limit, page, sorting]);

  const { data, error, isLoading, mutate } = useSWR(
    [QueryKey.ALLOCATOR_VERIFIED_CLIENTS, parameters],
    ([, fetchParameters]) => {
      return fetchAllocatorVerifiedClients(fetchParameters);
    },
    { keepPreviousData: true, revalidateOnMount: false }
  );

  const isLongLoading = useDelayedFlag(isLoading, 500);

  useEffect(() => {
    if (!data && !error && !isLoading) {
      mutate();
    }
  }, [data, error, isLoading, mutate]);

  return (
    <Card {...rest}>
      <header className="p-4">
        <h3 className="text-xl font-medium">Verified Clients</h3>
      </header>

      <div className="relative">
        {!data && isLoading && (
          <div className="flex justify-center p-6">
            <ChartLoader />
          </div>
        )}

        {!isLoading && !!error && (
          <p className="text-center text-sm text-muted-foregorund">
            An error has occured. Please try again later.
          </p>
        )}

        {!!data && !error && (
          <>
            <DataTable data={data.data} columns={columns} />
            <OverlayLoader show={isLongLoading} />
          </>
        )}
      </div>

      <CardFooter className="border-t w-full p-3">
        <Paginator
          page={page}
          pageSize={limit}
          pageSizeOptions={pageSizeOptions}
          onPageChange={setPage}
          onPageSizeChange={setLimit}
          total={data?.pagination.total ?? 0}
        />
      </CardFooter>
    </Card>
  );
}
