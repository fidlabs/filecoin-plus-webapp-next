"use client";

import { ChartWrapper } from "@/app/compliance-data-portal/components/chart-wrapper";
import { StackedBarGraph } from "@/app/compliance-data-portal/components/graphs/stacked-bar-graph";
import { useSearchParamsFilters } from "@/lib/hooks/use-search-params-filters";
import { useChartScale } from "@/lib/hooks/useChartScale";
import { type ComponentProps, useEffect, useMemo } from "react";

type DataItem = ComponentProps<typeof StackedBarGraph>["data"][number];

interface ChartDataItem extends DataItem {
  name: string;
  misreporting: number;
  misreportingName: string;
  notReporting: number;
  notReportingName: string;
  ok: number;
  okName: string;
}

export interface IPNIMisreportingHistoricalChartProps {
  data: ChartDataItem[];
  roundId: string;
}

export function IPNIMisreportingHistoricalChart({
  data,
  roundId,
}: IPNIMisreportingHistoricalChartProps) {
  const { calcPercentage, scale, selectedScale, setSelectedScale } =
    useChartScale(10);
  const { updateFilter } = useSearchParamsFilters();

  useEffect(() => {
    updateFilter("roundId", roundId, {
      navigationMethod: "push",
    });
  }, [roundId]);

  const graphData = useMemo(() => {
    if (!calcPercentage) {
      return data;
    }

    return data.map((item) => {
      const total = item.misreporting + item.notReporting + item.ok;
      return {
        ...item,
        misreporting: (item.misreporting / total) * 100,
        notReporting: (item.notReporting / total) * 100,
        ok: (item.ok / total) * 100,
      };
    });
  }, [calcPercentage, data]);

  return (
    <ChartWrapper
      title="IPNI Misreporting Over Time"
      id="IPNIMisreportingOverTime"
      addons={[
        {
          name: "What's here?",
          size: 3,
          value: (
            <p>
              A chart showing Storage Providers IPNI reporting status over time.
            </p>
          ),
        },
      ]}
      selectedScale={selectedScale}
      setSelectedScale={setSelectedScale}
    >
      <StackedBarGraph
        currentDataTab="Count"
        data={graphData}
        isLoading={false}
        unit="SP"
        scale={scale}
        usePercentage={calcPercentage}
      />
    </ChartWrapper>
  );
}
