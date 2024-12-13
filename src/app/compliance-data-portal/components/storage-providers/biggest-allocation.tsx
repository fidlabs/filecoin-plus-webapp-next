import {useStorageProviderBiggestDeal} from "@/lib/hooks/cdp.hooks";
import {StackedBarGraph} from "@/app/compliance-data-portal/components/graphs/stacked-bar-graph";
import {ChartWrapper} from "@/app/compliance-data-portal/components/chart-wrapper";
import {useCDPChartDataEngine} from "@/app/compliance-data-portal/hooks/useCDPChartDataEngine";

interface Props {
  setCurrentElement: (val: string) => void
}

const StorageProviderBiggestAllocation = ({setCurrentElement}: Props) => {
  const {
    isLoading, ref, usePercentage, chartData, currentTab, setCurrentTab, tabs, scale, selectedScale, setSelectedScale, data, palette
  } = useCDPChartDataEngine({
    fetchMethod: useStorageProviderBiggestDeal,
    setCurrentElement,
    id: 'BiggestDealsSP',
    unit: ' %',
    paletteDirection: 'dsc'
  })

  return <ChartWrapper
    title="Size Of The Biggest client allocation"
    tabs={tabs}
    currentTab={currentTab}
    setCurrentTab={setCurrentTab}
    id="BiggestDealsSP"
    selectedScale={selectedScale}
    setSelectedScale={setSelectedScale}

    addons={[{
      name: 'Total number of providers',
      value: data?.count
    }, {
      name: "What's here?",
      size: 2,
      value: "What % of the total data cap used comes from the single client"
    }]}
    ref={ref}>
    <StackedBarGraph customPalette={palette} data={chartData} usePercentage={usePercentage} scale={scale} isLoading={isLoading} unit="provider"/>
  </ChartWrapper>

}

export default StorageProviderBiggestAllocation;
