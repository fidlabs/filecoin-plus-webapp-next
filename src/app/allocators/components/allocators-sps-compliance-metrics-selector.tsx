import {
  TileSelector,
  TileSelectorItem,
  type TileSelectorItemProps,
  type TileSelectorProps,
} from "@/components/tile-selector";
import { AllocatorsPageSectionId } from "@/lib/constants";
import { type OnlyPropsMatchingType } from "@/lib/utils";
import { useCallback } from "react";
import { type FetchAllocatorsSPsComplianceDataParameters } from "../allocators-data";

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
  // "httpRetrievability",
  "urlFinderRetrievability",
  "totalDealSize",
] as const satisfies Metric[];

const metricLabelDict: Record<Metric, string> = {
  httpRetrievability: "HTTP Retrievability above average",
  urlFinderRetrievability: "RPA above average",
  numberOfClients: "At least 3 clients",
  totalDealSize: "At most 30% DC from a single client",
};

const metricActionMap: Record<Metric, TileSelectorItemProps["action"]> = {
  httpRetrievability: {
    label: "HTTP Retrievability",
    url: `/allocators#${AllocatorsPageSectionId.RETRIEVABILITY}`,
  },
  urlFinderRetrievability: {
    label: "RPA",
    url: `/allocators#${AllocatorsPageSectionId.RETRIEVABILITY}`,
  },
  numberOfClients: {
    label: "Client Diversity",
    url: `/allocators#${AllocatorsPageSectionId.CLIENT_DIVERSITY}`,
  },
  totalDealSize: {
    label: "Client Distribution",
    url: `/allocators#${AllocatorsPageSectionId.CLIENT_DISTRIBUTION}`,
  },
};

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
      {allMetricTypes.map((metric) => (
        <TileSelectorItem
          key={metric}
          value={metric}
          label={metricLabelDict[metric]}
          action={metricActionMap[metric]}
        />
      ))}
    </TileSelector>
  );
}

function isMetricType(input: string): input is Metric {
  return (allMetricTypes as string[]).includes(input);
}
