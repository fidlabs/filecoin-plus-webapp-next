"use client";
import { ChartWrapper } from "@/app/compliance-data-portal/components/chart-wrapper";
import { EditionRoundCheckbox } from "@/app/compliance-data-portal/components/edition-round-checkbox";
import { StackedBarGraph } from "@/app/compliance-data-portal/components/graphs/stacked-bar-graph";
import { useCDPChartDataEngine } from "@/app/compliance-data-portal/hooks/useCDPChartDataEngine";
import { useAllocatorBiggestDeal } from "@/lib/hooks/cdp.hooks";
import { barTabs, dataTabs } from "@/lib/providers/cdp.provider";

const AllocatorBiggestAllocation = () => {
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
    fetchMethod: useAllocatorBiggestDeal,
    unit: " %",
    paletteDirection: "dsc",
  });

  const unit = currentDataTab === "Count" ? "allocator" : currentDataTab;

  return (
    <>
      <EditionRoundCheckbox />
      <ChartWrapper
        title="Size Of The Biggest client allocation"
        tabs={barTabs}
        dataTabs={dataTabs}
        currentDataTab={currentDataTab}
        setCurrentDataTab={setCurrentDataTab}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        id="BiggestDealsAllocator"
        selectedScale={selectedScale}
        setSelectedScale={setSelectedScale}
        addons={[
          {
            name: "Total number of allocators",
            value: data?.count,
          },
          {
            name: "What's here?",
            size: 2,
            value:
              "What % of the total data cap used comes from the single client",
          },
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
    </>
  );
};

export default AllocatorBiggestAllocation;
