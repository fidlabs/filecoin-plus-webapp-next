import {StackedBarGraph} from "@/components/charts/compliance/graphs/stacked-bar-graph";
import {ChartWrapper} from "@/app/compliance-data-portal/components/chart-wrapper";
import {useCDPChartDataEngine} from "@/app/compliance-data-portal/hooks/useCDPChartDataEngine";
import {useAllocatorRetrievability} from "@/lib/hooks/cdp.hooks";

interface Props {
  currentElement?: string;
  plain?: boolean;
}

const AllocatorRetrievability = ({currentElement, plain}: Props) => {

  const {
    isLoading, usePercentage, chartData, currentTab, setCurrentTab, tabs, scale, selectedScale, setSelectedScale, palette
  } = useCDPChartDataEngine({
    fetchMethod: useAllocatorRetrievability,
    unit: ' %'
  })

  if (!!currentElement && currentElement !==  'RetrievabilityScoreAllocator') {
    return null;
  }

  return <ChartWrapper
    title="Retrievability Score"
    tabs={tabs}
    plain={plain}
    currentTab={currentTab}
    setCurrentTab={setCurrentTab}
    id="RetrievabilityScoreAllocator"
    selectedScale={selectedScale}
    setSelectedScale={setSelectedScale}>
    <StackedBarGraph customPalette={palette} data={chartData} usePercentage={usePercentage} scale={scale} isLoading={isLoading} unit="provider"/>
  </ChartWrapper>

}

export {AllocatorRetrievability};
