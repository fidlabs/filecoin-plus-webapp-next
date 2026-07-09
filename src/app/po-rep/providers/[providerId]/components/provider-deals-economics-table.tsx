"use client";

import { DealRailStateBadge } from "@/app/po-rep/components/deal-rail-state-badge";
import { DataTableSort } from "@/components/data-table-sort";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  fetchPoRepDealsList,
  PoRepDealRailState,
  type PoRepDealsList,
} from "@/lib/cdp";
import { QueryKey } from "@/lib/constants";
import { createInfiniteFetcherHook } from "@/lib/data-loading";
import { type F0IdInput } from "@/lib/f0-id";
import { createFilecoinPayRailUrl } from "@/lib/filecoin-pay";
import { divideBigint } from "@/lib/utils";
import { createColumnHelper } from "@tanstack/react-table";
import Link from "next/link";
import { parseAsString, parseAsStringEnum, useQueryState } from "nuqs";
import { PropsWithChildren, useCallback, useState } from "react";

type Deal = PoRepDealsList["data"][number];

export interface ProviderDealsEconomicsTableProps {
  providerId: F0IdInput;
}

type SortingHeadingProps = PropsWithChildren<{
  sortKey: string;
}>;

const pageSize = 10;
const sortQueryKey = "des";
const orderQueryKey = "deo";
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
    header: "Rail ID",
    cell({ row }) {
      if (!row.original) {
        return <Skeleton className="h-6 w-[50px]" />;
      }

      const { railId } = row.original;

      return railId !== null ? (
        <Button variant="link" asChild>
          <Link href={createFilecoinPayRailUrl({ railId })} target="_blank">
            #{railId}
          </Link>
        </Button>
      ) : (
        "-"
      );
    },
  }),
  columnHelper.display({
    header: "Rail State",
    cell({ row }) {
      if (!row.original) {
        return <Skeleton className="h-6 w-[75px]" />;
      }

      const { railState } = row.original;
      return railState !== null ? (
        <DealRailStateBadge state={railState} />
      ) : (
        "-"
      );
    },
  }),
  columnHelper.display({
    id: "predicted_revenue",
    header() {
      return (
        <SortingHeading sortKey="predicted_deal_revenue">
          Predicted Revenue
        </SortingHeading>
      );
    },
    cell({ row }) {
      if (!row.original) {
        return <Skeleton className="h-6 w-[50px]" />;
      }

      const { predictedDealRevenueWei, tokenDecimals, tokenSymbol } =
        row.original;

      return tokenDecimals !== null && tokenSymbol !== null
        ? formatTokenValue({
            value: predictedDealRevenueWei,
            tokenDecimals,
            tokenSymbol,
          })
        : "-";
    },
  }),
  columnHelper.display({
    id: "settlements_count",
    header() {
      return (
        <SortingHeading sortKey="total_settlements_count">
          Settlements No.
        </SortingHeading>
      );
    },
    cell({ row }) {
      if (!row.original) {
        return <Skeleton className="h-6 w-[50px]" />;
      }

      const { settlementsCount } = row.original;
      return settlementsCount !== null ? settlementsCount : "-";
    },
  }),
  columnHelper.display({
    id: "amount_settled",
    header() {
      return (
        <SortingHeading sortKey="total_amount_settled">
          Amount Settled
        </SortingHeading>
      );
    },
    cell({ row }) {
      if (!row.original) {
        return <Skeleton className="h-6 w-[50px]" />;
      }

      const { totalSettledValueWei, tokenDecimals, tokenSymbol } = row.original;

      return totalSettledValueWei !== null &&
        tokenDecimals !== null &&
        tokenSymbol !== null
        ? formatTokenValue({
            value: totalSettledValueWei,
            tokenDecimals,
            tokenSymbol,
          })
        : "-";
    },
  }),
  columnHelper.display({
    id: "last_settlement",
    header() {
      return (
        <SortingHeading sortKey="last_settlement_epoch">
          Last Settlement
        </SortingHeading>
      );
    },
    cell({ row }) {
      if (!row.original) {
        return <Skeleton className="h-[18px] w-[50px]" />;
      }

      const { lastSettlementAt } = row.original;
      return lastSettlementAt !== null
        ? dateFormatter.format(new Date(lastSettlementAt))
        : "-";
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

function formatTokenValue({
  value,
  tokenDecimals,
  tokenSymbol,
}: {
  value: bigint | string | number;
  tokenDecimals: number;
  tokenSymbol: string;
}) {
  const decimalValue = divideBigint(
    BigInt(value),
    10n ** BigInt(tokenDecimals),
    2
  );

  return decimalValue + " " + tokenSymbol;
}

export function ProviderDealsEconomicsTable({
  providerId,
}: ProviderDealsEconomicsTableProps) {
  const [sort] = useQueryState(
    sortQueryKey,
    parseAsString.withDefault("deal_id")
  );
  const [order] = useQueryState(
    orderQueryKey,
    parseAsStringEnum(["asc", "desc"]).withDefault("asc")
  );
  const [railState, setRailState] = useState<PoRepDealRailState>();

  const {
    data: pages = [],
    error,
    isLoading,
    size,
    setSize,
  } = useDeals({ railState, providerId, limit: pageSize, sort, order });

  const lastLoadedPage = pages.at(-1);
  const dealsCount = lastLoadedPage?.pagination.totalCount;
  const hasMore = lastLoadedPage && size < lastLoadedPage.pagination.pagesCount;
  const deals = pages.flatMap((page) => page.data);
  const extraItems =
    !error && pages.length !== size ? [...Array(pageSize)].map(() => null) : [];

  const items = [...deals, ...extraItems];

  const loadMore = useCallback(() => {
    setSize(size + 1);
  }, [size, setSize]);

  const handleRailStateChange = useCallback((value: string) => {
    setSize(1);
    setRailState(value === "all" ? undefined : (value as PoRepDealRailState));
  }, []);

  return (
    <div className="py-6">
      <div className="px-4 flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-sm font-semibold uppercase">
          Deals{dealsCount ? ` (${dealsCount})` : ""}
        </h4>

        <Select
          value={railState ?? "all"}
          onValueChange={handleRailStateChange}
        >
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="All Rail States" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Rail States</SelectItem>
            <SelectItem value={PoRepDealRailState.IDLE}>Idle</SelectItem>
            <SelectItem value={PoRepDealRailState.ACTIVE}>Active</SelectItem>
            <SelectItem value={PoRepDealRailState.TERMINATED}>
              Terminated
            </SelectItem>
            <SelectItem value={PoRepDealRailState.FINALIZED}>
              Finalized
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {!error && items.length === 0 && (
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
