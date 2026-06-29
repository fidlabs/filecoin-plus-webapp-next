"use client";

import {
  fetchPoRepProviderSliComplianceStatistics,
  type FetchPoRepProviderSliComplianceStatisticsParameters,
} from "@/app/po-rep/po-rep-data";
import { Skeleton } from "@/components/ui/skeleton";
import { QueryKey } from "@/lib/constants";
import { type F0IdInput } from "@/lib/f0-id";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { useMemo, type ReactNode } from "react";
import useSWR from "swr";

export interface PoRepProviderSLIPerformanceStatisticsGridProps {
  providerId: F0IdInput;
}

interface GridItemMetadata {
  label: string;
  value: ReactNode;
}

type GridItemProps = GridItemMetadata & VariantProps<typeof gridItemVariants>;

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

const gridItemVariants = cva("py-4 px-6 bg-gray-100/50 rounded-md", {
  variants: {
    variant: {
      success: "text-green-500",
      warning: "text-orange-500",
      error: "text-red-500",
      default: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export function PoRepProviderSLIPerformanceStatisticsGrid({
  providerId,
}: PoRepProviderSLIPerformanceStatisticsGridProps) {
  const parameters: FetchPoRepProviderSliComplianceStatisticsParameters = {
    providerId,
  };

  const { data, error } = useSWR(
    [QueryKey.PO_REP_PROVIDER_SLI_COMPLIANCE_STATISTICS, parameters],
    ([, fetchParameters]) => {
      return fetchPoRepProviderSliComplianceStatistics(fetchParameters);
    }
  );

  const gridItems = useMemo<GridItemProps[]>(() => {
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
        variant: data.nonCompliantDealsCount === 0 ? "default" : "warning",
      },
      {
        label: labels.unknownDealsCount,
        value: data.unknownDealsCount,
        variant: data.unknownDealsCount === 0 ? "default" : "error",
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
            <GridItem {...gridItemProps} key={index} />
          ))}
        </div>
      )}
    </div>
  );
}

function GridItem({ label, value, variant = "default" }: GridItemProps) {
  return (
    <div className={cn(gridItemVariants({ variant }))}>
      <p className="text-xs text-muted-foreground mb-2">{label}</p>
      {value !== null ? (
        <p className="text-lg font-semibold">{value}</p>
      ) : (
        <Skeleton className="h-6 w-[100px]" />
      )}
    </div>
  );
}
