"use client"
import {StackedBarGraph} from "@/components/charts/compliance/graphs/stacked-bar-graph";
import {ChartWrapper} from "@/app/compliance-data-portal/components/chart-wrapper";
import {useCDPChartDataEngine} from "@/app/compliance-data-portal/hooks/useCDPChartDataEngine";
import {useAllocatorRetrievability} from "@/lib/hooks/cdp.hooks";
import {barTabs, dataTabs} from "@/lib/providers/cdp.provider";

interface Props {
  currentElement?: string;
  plain?: boolean;
}

const AllocatorRetrievability = ({currentElement, plain}: Props) => {

  const {
    isLoading,
    usePercentage,
    chartData,
    currentTab,
    setCurrentTab,
    scale,
    selectedScale,
    setSelectedScale,
    palette,
    currentDataTab,
    setCurrentDataTab,
  } = useCDPChartDataEngine({
    fetchMethod: useAllocatorRetrievability,
    unit: ' %'
  })

  if (!!currentElement && currentElement !== 'RetrievabilityScoreAllocator') {
    return null;
  }

  const unit = currentDataTab === 'Count' ? 'allocator' : currentDataTab;


  return <ChartWrapper
    title="Retrievability Score"
    tabs={barTabs}
    dataTabs={dataTabs}
    currentDataTab={currentDataTab}
    setCurrentDataTab={setCurrentDataTab}
    plain={plain}
    currentTab={currentTab}
    setCurrentTab={setCurrentTab}
    id="RetrievabilityScoreAllocator"
    selectedScale={selectedScale}
    setSelectedScale={setSelectedScale}>
    <StackedBarGraph customPalette={palette} data={chartData} usePercentage={usePercentage} scale={scale}
                     isLoading={isLoading} unit={unit}/>
  </ChartWrapper>

}

export {AllocatorRetrievability};
