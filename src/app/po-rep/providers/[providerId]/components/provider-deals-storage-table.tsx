"use client";

import { DealStateBadge } from "@/app/po-rep/components/deal-state-badge";
import { DataTableSort } from "@/components/data-table-sort";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchPoRepDealsList, type PoRepDealsList } from "@/lib/cdp";
import { QueryKey } from "@/lib/constants";
import { createInfiniteFetcherHook } from "@/lib/data-loading";
import { type F0IdInput } from "@/lib/f0-id";
import { cn } from "@/lib/utils";
import { createColumnHelper } from "@tanstack/react-table";
import { filesize } from "filesize";
import { parseAsString, parseAsStringEnum, useQueryState } from "nuqs";
import { PropsWithChildren, useCallback } from "react";

type Deal = PoRepDealsList["data"][number];

export interface ProviderDealsStorageTableProps {
  providerId: F0IdInput;
}

type SortingHeadingProps = PropsWithChildren<{
  sortKey: string;
}>;

const pageSize = 10;
const sortQueryKey = "dss";
const orderQueryKey = "dso";
const dateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  year: "numeric",
});
const columnHelper = createColumnHelper<Deal | null>();
const columns = [
  columnHelper.display({
    id: "deal-id",
    header() {
      return <SortingHeading sortKey="deal_id">Deal #</SortingHeading>;
    },
    cell({ row }) {
      return row.original ? (
        `#${row.original.dealId}`
      ) : (
        <Skeleton className="h-[18px] w-[50px]" />
      );
    },
  }),
  columnHelper.display({
    header: "State",
    cell({ row }) {
      return row.original ? (
        <DealStateBadge state={row.original.dealState} />
      ) : (
        <Skeleton className="h-6 w-[75px]" />
      );
    },
  }),
  columnHelper.display({
    header: "Onboarded",
    cell({ row }) {
      if (!row.original) {
        return <Skeleton className="h-[18px] w-[30px]" />;
      }

      const onboarded = row.original.isDataOnboarded;
      return (
        <span
          className={cn(
            "font-semibold text-yellow-500",
            onboarded && "text-green-500"
          )}
        >
          {onboarded ? "Yes" : "No"}
        </span>
      );
    },
  }),

  columnHelper.display({
    id: "deal-size",
    header() {
      return <SortingHeading sortKey="deal_size_bytes">Size</SortingHeading>;
    },
    cell({ row }) {
      return row.original ? (
        filesize(row.original.dealSizeBytes, { standard: "iec" })
      ) : (
        <Skeleton className="h-[18px] w-[50px]" />
      );
    },
  }),
  columnHelper.display({
    id: "proposal-date",
    header() {
      return (
        <SortingHeading sortKey="deal_created_at_epoch">
          Proposal Date
        </SortingHeading>
      );
    },
    cell({ row }) {
      return row.original ? (
        dateFormatter.format(new Date(row.original.dealCreatedAt))
      ) : (
        <Skeleton className="h-[18px] w-[50px]" />
      );
    },
  }),
];

const useDeals = createInfiniteFetcherHook(
  fetchPoRepDealsList,
  (pageIndex, previousData, parameters) => {
    if (
      previousData &&
      previousData.pagination.page === previousData.pagination.pagesCount
    ) {
      return null;
    }

    return [
      QueryKey.PO_REP_DEALS_LIST,
      {
        ...parameters,
        page: pageIndex + 1,
      },
    ];
  }
);

export function ProviderDealsStorageTable({
  providerId,
}: ProviderDealsStorageTableProps) {
  const [sort] = useQueryState(
    sortQueryKey,
    parseAsString.withDefault("deal_id")
  );
  const [order] = useQueryState(
    orderQueryKey,
    parseAsStringEnum(["asc", "desc"]).withDefault("asc")
  );

  const {
    data: pages = [],
    error,
    isLoading,
    size,
    setSize,
  } = useDeals(
    { providerId, limit: pageSize, sort, order },
    {
      keepPreviousData: true,
    }
  );

  const lastLoadedPage = pages.at(-1);
  const dealsCount = lastLoadedPage?.pagination.totalCount;
  const hasMore = lastLoadedPage && size < lastLoadedPage.pagination.pagesCount;
  const deals = pages.flatMap((page) => page.data);
  const extraItems = !error
    ? [...Array((size - pages.length) * pageSize)].map(() => null)
    : [];

  const items = [...deals, ...extraItems];

  const loadMore = useCallback(() => {
    setSize(size + 1);
  }, [size, setSize]);

  return (
    <div className="pb-4">
      <h4 className="text-sm font-semibold uppercase px-4">
        Deals{dealsCount ? ` (${dealsCount})` : ""}
      </h4>

      {!error && deals.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-6">
          Nothing to show.
        </p>
      )}

      {items.length > 0 && <DataTable columns={columns} data={items} />}

      {error && (
        <p className="text-sm text-muted-foreground text-center py-6">
          An error occuered while loading the data. Please try again later.
        </p>
      )}

      {!isLoading && hasMore && (
        <div className="flex justify-center pt-2">
          <Button variant="link" onClick={loadMore}>
            Show More
          </Button>
        </div>
      )}
    </div>
  );
}

function SortingHeading({ children, sortKey }: SortingHeadingProps) {
  const [currentSortKey, setCurrentSortKey] = useQueryState(
    sortQueryKey,
    parseAsString.withDefault("deal_id")
  );
  const [direction, setDirection] = useQueryState(
    orderQueryKey,
    parseAsStringEnum(["asc", "desc"]).withDefault("asc")
  );

  const handleSort = useCallback(
    (direction: "asc" | "desc") => {
      setCurrentSortKey(sortKey);
      setDirection(direction);
    },
    [setCurrentSortKey, setDirection, sortKey]
  );

  return (
    <DataTableSort
      direction={currentSortKey === sortKey ? direction : undefined}
      onSort={handleSort}
    >
      {children}
    </DataTableSort>
  );
}
