"use client";

import { StatBox, type StatBoxProps } from "@/components/stat-box";
import { fetchPoRepProviderComplianceStatistics } from "@/lib/cdp";
import { QueryKey } from "@/lib/constants";
import { createFetcherHook } from "@/lib/data-loading";
import { type F0IdInput } from "@/lib/f0-id";
import { useMemo } from "react";

export interface PoRepProviderSLIPerformanceStatisticsGridProps {
  providerId: F0IdInput;
}

const labels = {
  totalDealCount: "Total Deals Count",
  activeDealsCount: "Active Deals Count",
  compliantDealsPercentage: "Compliant Deals (%)",
  compliantDealsCount: "Compliant Deals",
  nonCompliantDealsCount: "Non-compliant Deals",
  unknownDealsCount: "Unknown Deals",
} as const;

const numberFormatter = new Intl.NumberFormat("en-US", {
  useGrouping: true,
});

const percentageFormatter = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 2,
});

const useStats = createFetcherHook(
  fetchPoRepProviderComplianceStatistics,
  QueryKey.PO_REP_SLI_COMPLIANCE_HISTORY
);

export function PoRepProviderSLIPerformanceStatisticsGrid({
  providerId,
}: PoRepProviderSLIPerformanceStatisticsGridProps) {
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
        label: labels.totalDealCount,
        value: numberFormatter.format(data.totalDealsCount),
      },
      {
        label: labels.activeDealsCount,
        value: numberFormatter.format(data.activeDealsCount),
      },
      {
        label: labels.compliantDealsPercentage,
        value:
          data.compliantDealsPercentage === null
            ? "-"
            : percentageFormatter.format(data.compliantDealsPercentage),
        variant:
          data.compliantDealsPercentage === null
            ? "default"
            : data.compliantDealsPercentage === 1
              ? "success"
              : data.compliantDealsPercentage > 0.9
                ? "warning"
                : "error",
      },
      {
        label: labels.compliantDealsCount,
        value: data.compliantDealsCount,
        variant: data.compliantDealsCount === 0 ? "default" : "success",
      },
      {
        label: labels.nonCompliantDealsCount,
        value: data.nonCompliantDealsCount,
        variant: data.nonCompliantDealsCount === 0 ? "default" : "error",
      },
      {
        label: labels.unknownDealsCount,
        value: data.unknownDealsCount,
        variant: data.unknownDealsCount === 0 ? "default" : "warning",
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
