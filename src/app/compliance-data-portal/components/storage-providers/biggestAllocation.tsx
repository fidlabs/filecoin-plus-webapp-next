import {useStorageProviderBiggestDeal} from "@/lib/hooks/cdp.hooks";
import {StackedBarGraph} from "@/app/compliance-data-portal/components/graphs/stacked-bar-graph";
import {ChartWrapper} from "@/app/compliance-data-portal/components/chart-wrapper";
import {useCDPChartDataEngine} from "@/app/compliance-data-portal/hooks/useCDPChartDataEngine";

interface Props {
  setCurrentElement: (val: string) => void
}

const StorageProviderBiggestAllocation = ({setCurrentElement}: Props) => {
  const {
    isLoading, ref, chartData, currentTab, setCurrentTab, tabs, scale, selectedScale, setSelectedScale, data
  } = useCDPChartDataEngine(useStorageProviderBiggestDeal, setCurrentElement, 'NumberOfDealsSP', ' %')

  return <ChartWrapper
    title="Size Of The Biggest client allocation"
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
      value: "What % of the total data cap received comes from the single client"
    }]}
    ref={ref}>
    <StackedBarGraph data={chartData} scale={scale} isLoading={isLoading} unit="provider"/>
  </ChartWrapper>

}

export default StorageProviderBiggestAllocation;
