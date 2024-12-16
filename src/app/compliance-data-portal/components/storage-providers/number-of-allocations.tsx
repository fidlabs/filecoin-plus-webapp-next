import {useStorageProviderNumberOfDeals} from "@/lib/hooks/cdp.hooks";
import {StackedBarGraph} from "@/app/compliance-data-portal/components/graphs/stacked-bar-graph";
import {ChartWrapper} from "@/app/compliance-data-portal/components/chart-wrapper";
import {useCDPChartDataEngine} from "@/app/compliance-data-portal/hooks/useCDPChartDataEngine";

interface Props {
  setCurrentElement: (val: string) => void
}

const StorageProviderNumberOfAllocations = ({setCurrentElement}: Props) => {
  const {
    isLoading, ref, usePercentage, chartData, currentTab, setCurrentTab, tabs, scale, selectedScale, setSelectedScale, data, palette
  } = useCDPChartDataEngine({
    fetchMethod: useStorageProviderNumberOfDeals,
    setCurrentElement,
    id: 'NumberOfDealsSP',
    unit: ' clients'
  })

  return <ChartWrapper
    title="Number of allocations"
    tabs={tabs}
    currentTab={currentTab}
    setCurrentTab={setCurrentTab}
    id="NumberOfDealsSP"
    selectedScale={selectedScale}
    setSelectedScale={setSelectedScale}
    addons={[{
      name: 'Total number of providers',
      value: data?.count
    }, {
      name: "What's here?",
      size: 2,
      value: "Chart is showing how many client each provider has"
    }]}
    ref={ref}>
    <StackedBarGraph customPalette={palette} usePercentage={usePercentage} data={chartData} scale={scale} isLoading={isLoading} unit="provider"/>
  </ChartWrapper>

}

export default StorageProviderNumberOfAllocations;
