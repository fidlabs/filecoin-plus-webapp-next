"use client";

import { ChartWrapper } from "@/app/compliance-data-portal/components/chart-wrapper";
import { StackedBarGraph } from "@/app/compliance-data-portal/components/graphs/stacked-bar-graph";
import { RetrievabilityTypeSelect } from "@/app/compliance-data-portal/components/retrievability-type-select";
import useWeeklyChartData from "@/app/compliance-data-portal/hooks/useWeeklyChartData";
import { Checkbox } from "@/components/ui/checkbox";
import { useAllocatorRetrievability } from "@/lib/hooks/cdp.hooks";
import { useSearchParamsFilters } from "@/lib/hooks/use-search-params-filters";
import { useChartScale } from "@/lib/hooks/useChartScale";
import { barTabs, dataTabs } from "@/lib/providers/cdp.provider";
import { type ComponentProps, useCallback, useEffect, useState } from "react";

type CheckboxProps = ComponentProps<typeof Checkbox>;
type CheckedChangeHandler = NonNullable<CheckboxProps["onCheckedChange"]>;

const retrievabilityFilterKey = "retrievabilityType";
const openDataFilterKey = "openDataOnly";

export default function AllocatorRetrievabilityPage() {
  const { filters, updateFilter } = useSearchParamsFilters();
  const retrievabilityType = filters[retrievabilityFilterKey] ?? "rpa";
  const openDataOnly = filters[openDataFilterKey] === "true";
  const [usePercentage, setUsePercentage] = useState(false);

  const { data, isLoading } = useAllocatorRetrievability({
    retrievabilityType,
    openDataOnly,
  });

  const {
    chartData,
    currentTab,
    setCurrentTab,
    minValue,
    palette,
    currentDataTab,
    setCurrentDataTab,
  } = useWeeklyChartData({
    data: data?.buckets,
    unit: " %",
    usePercentage,
  });

  const { scale, calcPercentage, selectedScale, setSelectedScale } =
    useChartScale(minValue);

  const handleOpenDataToggleChange = useCallback<CheckedChangeHandler>(
    (state) => {
      updateFilter(openDataFilterKey, state === true ? "true" : undefined);
    },
    [updateFilter]
  );

  useEffect(() => {
    setUsePercentage(calcPercentage);
  }, [calcPercentage]);

  const unit = currentDataTab === "Count" ? "allocator" : currentDataTab;

  return (
    <ChartWrapper
      title="Retrievability Score"
      tabs={barTabs}
      dataTabs={dataTabs}
      currentDataTab={currentDataTab}
      setCurrentDataTab={setCurrentDataTab}
      currentTab={currentTab}
      setCurrentTab={setCurrentTab}
      id="RetrievabilityScoreAllocator"
      selectedScale={selectedScale}
      setSelectedScale={setSelectedScale}
      additionalFilters={[
        <div
          key="http-retrievability-toggle"
          className="flex items-center space-x-2"
        >
          <RetrievabilityTypeSelect
            label="Retrievability Type"
            defaultValue="rpa"
          />
        </div>,
        <div
          key="open-data-toggle"
          className="flex items-center space-x-2 py-3.5 px-2"
        >
          <Checkbox
            id="open-data"
            checked={openDataOnly}
            onCheckedChange={handleOpenDataToggleChange}
          />
          <label
            className="text-sm font-medium leading-none"
            htmlFor="open-data"
          >
            Open Data Only
          </label>
        </div>,
      ]}
    >
      <StackedBarGraph
        currentDataTab={currentDataTab}
        customPalette={palette}
        data={chartData}
        usePercentage={usePercentage}
        scale={scale}
        isLoading={isLoading}
        unit={unit}
      />
    </ChartWrapper>
  );
}
