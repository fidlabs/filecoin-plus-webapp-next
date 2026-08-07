"use client";

import { StatBox, type StatBoxProps } from "@/components/stat-box";
import { fetchPoRepProviderEcononomicsStatistics } from "@/lib/cdp";
import { QueryKey } from "@/lib/constants";
import { createFetcherHook } from "@/lib/data-loading";
import { type F0IdInput } from "@/lib/f0-id";
import { useMemo } from "react";

export interface PoRepProviderEconomicsStatisticsGridProps {
  providerId: F0IdInput;
}

const numberFormatter = new Intl.NumberFormat("en-US", {
  useGrouping: true,
});

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  useGrouping: true,
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const useStats = createFetcherHook(
  fetchPoRepProviderEcononomicsStatistics,
  QueryKey.PO_REP_PROVIDER_ECONOMICS_STATISTICS
);

const labels = {
  totalRailsCount: "Total Rails Count",
  activeRailsCount: "Active Rails Count",
  lastSettlementAt: "Last Settlement",
  totalRevenueUSD: "Total Revenue",
  predictedRevenueUSD: "Predicted Revenue",
  totalSettledUSD: "Total Settled",
} as const;

export function PoRepProviderEconomicsStatisticsGrid({
  providerId,
}: PoRepProviderEconomicsStatisticsGridProps) {
  const { data, error } = useStats({ providerId });

  const gridItems = useMemo<StatBoxProps[]>(() => {
    if (!data) {
      return Object.values(labels).map((label) => ({
        label,
        value: null,
      }));
    }

    return [
      {
        label: labels.totalRailsCount,
        value: numberFormatter.format(data.totalRailsCount),
      },
      {
        label: labels.activeRailsCount,
        value: numberFormatter.format(data.activeRailsCount),
      },
      {
        label: labels.lastSettlementAt,
        value:
          data.lastSettlementAt !== null
            ? dateFormatter.format(new Date(data.lastSettlementAt))
            : "-",
      },
      {
        label: labels.predictedRevenueUSD,
        value: usdFormatter.format(data.predictedRevenueUSD),
      },
      {
        label: labels.totalSettledUSD,
        value: usdFormatter.format(data.totalSettledUSD),
      },
      {
        label: labels.totalRevenueUSD,
        value: usdFormatter.format(data.totalRevenueUSD),
      },
    ];
  }, [data]);

  return (
    <div>
      {error ? (
        <div className="py-6">
          <p className="text-sm text-center">
            An error occurred while loading data. Please try again later.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {gridItems.map((gridItemProps, index) => (
            <StatBox {...gridItemProps} key={index} />
          ))}
        </div>
      )}
    </div>
  );
}
