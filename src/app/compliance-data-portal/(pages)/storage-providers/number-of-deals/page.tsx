"use client";
import { useStorageProviderNumberOfDeals } from "@/lib/hooks/cdp.hooks";
import { StackedBarGraph } from "@/app/compliance-data-portal/components/graphs/stacked-bar-graph";
import { ChartWrapper } from "@/app/compliance-data-portal/components/chart-wrapper";
import { useCDPChartDataEngine } from "@/app/compliance-data-portal/hooks/useCDPChartDataEngine";
import { barTabs, dataTabs } from "@/lib/providers/cdp.provider";
import { EditionRoundCheckbox } from "@/app/compliance-data-portal/components/edition-round-checkbox";

const StorageProviderNumberOfAllocations = () => {
  const {
    isLoading,
    usePercentage,
    chartData,
    currentTab,
    setCurrentTab,
    scale,
    selectedScale,
    setSelectedScale,
    data,
    palette,
    currentDataTab,
    setCurrentDataTab,
  } = useCDPChartDataEngine({
    fetchMethod: useStorageProviderNumberOfDeals,
    unit: " clients",
  });

  const unit = currentDataTab === "Count" ? "provider" : currentDataTab;

  return (
    <>
      <EditionRoundCheckbox />
      <ChartWrapper
        title="Number of Allocations"
        tabs={barTabs}
        dataTabs={dataTabs}
        currentDataTab={currentDataTab}
        setCurrentDataTab={setCurrentDataTab}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        id="NumberOfDealsSP"
        selectedScale={selectedScale}
        setSelectedScale={setSelectedScale}
        addons={[
          {
            name: "Total number of providers",
            value: data?.count,
          },
          {
            name: "What's here?",
            size: 2,
            value: "Chart is showing how many client each provider has",
          },
        ]}
      >
        <StackedBarGraph
          customPalette={palette}
          usePercentage={usePercentage}
          data={chartData}
          scale={scale}
          isLoading={isLoading}
          unit={unit}
          currentDataTab={currentDataTab}
        />
      </ChartWrapper>
    </>
  );
};

export default StorageProviderNumberOfAllocations;
