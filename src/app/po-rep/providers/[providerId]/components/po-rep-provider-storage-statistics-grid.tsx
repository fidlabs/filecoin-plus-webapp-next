"use client";

import { StatBox, type StatBoxProps } from "@/components/stat-box";
import { fetchPoRepProviderStorageStatistics } from "@/lib/cdp";
import { QueryKey } from "@/lib/constants";
import { createFetcherHook } from "@/lib/data-loading";
import { type F0IdInput } from "@/lib/f0-id";
import { filesize } from "filesize";
import { useMemo } from "react";

export interface PoRepProviderStorageStatisticsGridProps {
  providerId: F0IdInput;
}

const numberFormatter = new Intl.NumberFormat("en-US", {
  useGrouping: true,
});

const useStats = createFetcherHook(
  fetchPoRepProviderStorageStatistics,
  QueryKey.PO_REP_PROVIDER_STORAGE_STATISTICS
);

const labels = {
  totalDealsCount: "Total Deals Count",
  onboardedDealsCount: "Onboarded Deals Count",
  totalAvailableSpace: "Total Available Space",
  pendingSpace: "Pending Space",
  committedSpace: "Committed Space",
  onboardedDataSize: "Oboarded Data Size",
} as const;

export function PoRepProviderStorageStatisticsGrid({
  providerId,
}: PoRepProviderStorageStatisticsGridProps) {
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
        label: labels.totalDealsCount,
        value: numberFormatter.format(data.totalDealsCount),
      },
      {
        label: labels.onboardedDealsCount,
        value: numberFormatter.format(data.onboardedDealsCount),
      },
      {
        label: labels.totalAvailableSpace,
        value: filesize(data.totalAvailableBytes, { standard: "iec" }),
      },
      {
        label: labels.pendingSpace,
        value: filesize(data.pendingBytes, { standard: "iec" }),
      },
      {
        label: labels.committedSpace,
        value: filesize(data.committedBytes, { standard: "iec" }),
      },
      {
        label: labels.onboardedDataSize,
        value: filesize(data.onboardedBytes, { standard: "iec" }),
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
