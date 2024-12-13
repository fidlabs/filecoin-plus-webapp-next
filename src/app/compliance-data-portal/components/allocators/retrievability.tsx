import {StackedBarGraph} from "@/app/compliance-data-portal/components/graphs/stacked-bar-graph";
import {ChartWrapper} from "@/app/compliance-data-portal/components/chart-wrapper";
import {useCDPChartDataEngine} from "@/app/compliance-data-portal/hooks/useCDPChartDataEngine";
import {useAllocatorRetrievability} from "@/lib/hooks/cdp.hooks";

interface Props {
  setCurrentElement: (val: string) => void
}

const AllocatorRetrievability = ({setCurrentElement}: Props) => {

  const {
    isLoading, ref, usePercentage, chartData, currentTab, setCurrentTab, tabs, scale, selectedScale, setSelectedScale, palette
  } = useCDPChartDataEngine({
    fetchMethod: useAllocatorRetrievability,
    setCurrentElement,
    id: 'RetrievabilityScoreAllocator',
    unit: ' %'
  })

  return <ChartWrapper
    title="Retrievability Score"
    tabs={tabs}
    currentTab={currentTab}
    setCurrentTab={setCurrentTab}
    id="RetrievabilityScoreAllocator"
    selectedScale={selectedScale}
    setSelectedScale={setSelectedScale}
    ref={ref}>
    <StackedBarGraph customPalette={palette} data={chartData} usePercentage={usePercentage} scale={scale} isLoading={isLoading} unit="provider"/>
  </ChartWrapper>

}

export default AllocatorRetrievability;
