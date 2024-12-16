import {StackedBarGraph} from "@/app/compliance-data-portal/components/graphs/stacked-bar-graph";
import {ChartWrapper} from "@/app/compliance-data-portal/components/chart-wrapper";
import {useCDPChartDataEngine} from "@/app/compliance-data-portal/hooks/useCDPChartDataEngine";
import {useStorageProviderRetrievability} from "@/lib/hooks/cdp.hooks";

interface Props {
  setCurrentElement: (val: string) => void
}

const StorageProviderRetrievability = ({setCurrentElement}: Props) => {

  const {
    isLoading, ref, usePercentage, chartData, currentTab, setCurrentTab, tabs, scale, selectedScale, setSelectedScale, palette
  } = useCDPChartDataEngine({
    fetchMethod: useStorageProviderRetrievability,
    setCurrentElement,
    id: 'RetrievabilityScoreSP',
    unit: ' %',
  })

  return <ChartWrapper
    title="Retrievability Score"
    tabs={tabs}
    currentTab={currentTab}
    setCurrentTab={setCurrentTab}
    id="RetrievabilityScoreSP"
    selectedScale={selectedScale}
    setSelectedScale={setSelectedScale}
    ref={ref}>
    <StackedBarGraph customPalette={palette} usePercentage={usePercentage} data={chartData} scale={scale} isLoading={isLoading} unit="provider"/>
  </ChartWrapper>

}

export default StorageProviderRetrievability;
