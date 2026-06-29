"use client";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchPoRepDealsList, type PoRepDealsList } from "@/lib/cdp";
import { QueryKey } from "@/lib/constants";
import { createInfiniteFetcherHook } from "@/lib/data-loading";
import { type F0IdInput } from "@/lib/f0-id";
import { cn } from "@/lib/utils";
import { createColumnHelper } from "@tanstack/react-table";
import { createElement, useCallback, useMemo } from "react";

type SliVariant = "retrievability" | "bandwidth" | "latency" | "indexing";
type Deal = PoRepDealsList["data"][number];

export interface DealsComplianceTableProps {
  providerId: F0IdInput;
}

interface SliMeasurementProps {
  deal: Deal | null;
  variant: SliVariant;
}

const pageSize = 10;
const columnHelper = createColumnHelper<Deal | null>();
const columns = [
  columnHelper.display({
    id: "status-dot",
    size: 16,
    cell({ row }) {
      const deal = row.original;
      const sliTuples: [
        SliVariant,
        requiredValue: number | null,
        measuredValue: number | null,
      ][] = deal
        ? [
            [
              "retrievability",
              deal.minRequiredRetrievability,
              deal.predictedAverageRetrievability,
            ],
            [
              "bandwidth",
              deal.minRequiredBandwidthMbps,
              deal.predictedAverageBandwidthMbps,
            ],
            [
              "latency",
              deal.maxRequiredLatencyMs,
              deal.predictedAverageLatencyMs,
            ],
            [
              "indexing",
              deal.minRequiredIndexing,
              deal.predictedAverageIndexing,
            ],
          ]
        : [];

      const sliResults = sliTuples.map((maybeTuple) => {
        if (maybeTuple === null) {
          return true;
        }

        const [variant, requiredValue, measuredValue] = maybeTuple;
        return isMeetingSli(requiredValue, measuredValue, variant);
      });

      const unknown = sliResults.some((result) => result === null);
      const success = sliResults.every(Boolean);

      return createElement(deal ? "div" : Skeleton, {
        className: cn(
          "h-2 w-2 rounded-full",
          !!deal && "bg-red-500",
          !!deal && success && "bg-green-500",
          !!deal && unknown && "bg-yellow-500"
        ),
      });
    },
  }),
  columnHelper.display({
    header: "Deal #",
    cell({ row }) {
      return row.original ? (
        `#${row.original.dealId}`
      ) : (
        <Skeleton className="h-[18px] w-[50px]" />
      );
    },
  }),
  columnHelper.display({
    header: "Retrievability",
    cell({ row }) {
      return <SliMeasurment variant="retrievability" deal={row.original} />;
    },
  }),
  columnHelper.display({
    header: "Bandwidth",
    cell({ row }) {
      return <SliMeasurment variant="bandwidth" deal={row.original} />;
    },
  }),
  columnHelper.display({
    header: "Latency",
    cell({ row }) {
      return <SliMeasurment variant="latency" deal={row.original} />;
    },
  }),
  columnHelper.display({
    header: "Indexing",
    cell({ row }) {
      return (
        <div className="flex justify-end">
          <SliMeasurment variant="indexing" deal={row.original} />
        </div>
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
const numberFormatter = new Intl.NumberFormat("en-US");
const percentageFormatter = new Intl.NumberFormat("en-US", {
  style: "percent",
});

function isMeetingSli(
  requiredValue: number | null,
  measuredValue: number | null,
  sliVariant: SliVariant
): boolean | null {
  if (requiredValue === null) {
    return true;
  }

  if (measuredValue === null) {
    return null;
  }

  return sliVariant !== "latency"
    ? measuredValue >= requiredValue
    : measuredValue <= requiredValue;
}

function formatSliValue(
  value: number | null,
  variant: SliVariant,
  defaultValue?: number
): string {
  const mergedValue = value ?? defaultValue ?? null;

  if (mergedValue === null) {
    return "N/A";
  }

  const suffix = getSliValueSuffix(variant);

  switch (variant) {
    case "retrievability":
    case "indexing":
      return percentageFormatter.format(mergedValue) + suffix;
    default:
      return numberFormatter.format(mergedValue) + suffix;
  }
}

function getSliValueSuffix(variant: SliMeasurementProps["variant"]): string {
  switch (variant) {
    case "bandwidth":
      return " Mbps";
    case "latency":
      return "ms";
    default:
      return "";
  }
}

export function ProviderDealsComplianceTable({
  providerId,
}: DealsComplianceTableProps) {
  const {
    data: pages = [],
    error,
    isLoading,
    size,
    setSize,
  } = useDeals(
    { providerId, limit: pageSize, activeOnly: true },
    {
      keepPreviousData: true,
    }
  );

  const lastLoadedPage = pages.at(-1);
  const dealsCount = lastLoadedPage?.pagination.totalCount;
  const hasMore = lastLoadedPage && size < lastLoadedPage.pagination.pagesCount;
  const deals = pages.flatMap((page) => page.data);
  const extraItems = [...Array((size - pages.length) * pageSize)].map(
    () => null
  );

  const items = [...deals, ...extraItems];

  const loadMore = useCallback(() => {
    setSize(size + 1);
  }, [size, setSize]);

  return (
    <div>
      <h4 className="text-sm font-semibold uppercase px-4">
        Active Deals{dealsCount ? ` (${dealsCount})` : ""}
      </h4>

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

function SliMeasurment({ deal, variant }: SliMeasurementProps) {
  const [requiredValue, measuredValue] = useMemo(() => {
    if (!deal) {
      return [null, null];
    }

    switch (variant) {
      case "retrievability":
        return [
          deal.minRequiredRetrievability,
          deal.predictedAverageRetrievability,
        ];
      case "bandwidth":
        return [
          deal.minRequiredBandwidthMbps,
          deal.predictedAverageBandwidthMbps,
        ];
      case "latency":
        return [deal.maxRequiredLatencyMs, deal.predictedAverageLatencyMs];
      case "indexing":
        return [deal.minRequiredIndexing, deal.predictedAverageIndexing];
    }
  }, [deal, variant]);

  const required = requiredValue !== null;
  const meetingSli =
    variant !== null && isMeetingSli(requiredValue, measuredValue, variant);

  return deal !== null ? (
    <p
      className={cn(
        "text-sm",
        !required && "opacity-30",
        required && meetingSli === null && "text-yellow-500",
        required && meetingSli === true && "text-green-500",
        required && meetingSli === false && "text-red-500"
      )}
    >
      <span className="font-semibold">
        {formatSliValue(measuredValue, variant)}
      </span>
      <span className="color-muted-foreground">
        {" "}
        ({formatSliValue(requiredValue, variant, 0)})
      </span>
    </p>
  ) : (
    <Skeleton className="h-[18px] w-[100px] max-w-full" />
  );
}
