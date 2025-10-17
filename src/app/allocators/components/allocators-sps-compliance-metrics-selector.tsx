import {
  TileSelector,
  TileSelectorItem,
  TileSelectorProps,
} from "@/components/tile-selector";
import { StorageProvidersPageSectionId } from "@/lib/constants";
import { OnlyPropsMatchingType } from "@/lib/utils";
import { useCallback } from "react";
import { FetchAllocatorsSPsComplianceDataParameters } from "../allocators-data";

type Metrics = Partial<
  OnlyPropsMatchingType<
    FetchAllocatorsSPsComplianceDataParameters,
    boolean | void
  >
>;

type Metric = keyof Metrics;

export interface AllocatorsSPsComplianceMetricsSelectorProps
  extends Omit<TileSelectorProps, "children" | "value" | "onValueChange"> {
  includeDisabledMetricsOnChange?: boolean;
  metrics: Metrics;
  onMetricsChange(metrics: Metrics): void;
}

const allMetricTypes = [
  "numberOfClients",
  "retrievability",
  "totalDealSize",
] as const satisfies Array<keyof Metrics>;

export function AllocatorsSPsComplianceMetricsSelector({
  includeDisabledMetricsOnChange = false,
  metrics,
  onMetricsChange,
  ...rest
}: AllocatorsSPsComplianceMetricsSelectorProps) {
  const providedMetricsKeys = Object.keys(metrics) as Metric[];
  const value = providedMetricsKeys.filter(
    (metricType) => !!metrics[metricType]
  );

  const handleValueChange = useCallback<
    NonNullable<TileSelectorProps["onValueChange"]>
  >(
    (value) => {
      const entries: [keyof Metrics, boolean][] = includeDisabledMetricsOnChange
        ? allMetricTypes.map((metricType) => [
            metricType,
            value.includes(metricType),
          ])
        : value.filter(isMetricType).map((metricType) => [metricType, true]);

      onMetricsChange(Object.fromEntries(entries) as Metrics);
    },
    [includeDisabledMetricsOnChange, onMetricsChange]
  );

  return (
    <TileSelector {...rest} value={value} onValueChange={handleValueChange}>
      <TileSelectorItem
        label="Retrievability score above average"
        action={{
          label: "Retrievability",
          url: `/storage-providers#${StorageProvidersPageSectionId.RETRIEVABILITY}`,
        }}
        value="retrievability"
      />

      <TileSelectorItem
        label="At least 3 clients"
        action={{
          label: "Client Diversity",
          url: `/storage-providers#${StorageProvidersPageSectionId.CLIENT_DIVERSITY}`,
        }}
        value="numberOfClients"
      />

      <TileSelectorItem
        label="At most 30% DC from a single client"
        action={{
          label: "Biggest Allocation",
          url: `/storage-providers#${StorageProvidersPageSectionId.CLIENT_DISTRIBUTION}`,
        }}
        value="totalDealSize"
      />
    </TileSelector>
  );
}

function isMetricType(input: string): input is Metric {
  return (allMetricTypes as string[]).includes(input);
}
