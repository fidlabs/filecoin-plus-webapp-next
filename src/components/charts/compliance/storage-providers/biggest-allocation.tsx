import {useStorageProviderBiggestDeal} from "@/lib/hooks/cdp.hooks";
import {StackedBarGraph} from "@/components/charts/compliance/graphs/stacked-bar-graph";
import {ChartWrapper} from "@/app/compliance-data-portal/components/chart-wrapper";
import {useCDPChartDataEngine} from "@/app/compliance-data-portal/hooks/useCDPChartDataEngine";

interface Props {
  currentElement?: string;
  plain?: boolean;
}

const StorageProviderBiggestAllocation = ({currentElement, plain}: Props) => {

  const {
    isLoading, usePercentage, chartData, currentTab, setCurrentTab, tabs, scale, selectedScale, setSelectedScale, data, palette
  } = useCDPChartDataEngine({
    fetchMethod: useStorageProviderBiggestDeal,
    unit: ' %',
    paletteDirection: 'dsc'
  })

  if (!!currentElement && currentElement !==  'BiggestDealsSP') {
    return null;
  }

  return <ChartWrapper
    title="Size Of The Biggest client allocation"
    tabs={tabs}
    plain={plain}
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
    }]}>
    <StackedBarGraph customPalette={palette} data={chartData} usePercentage={usePercentage} scale={scale} isLoading={isLoading} unit="provider"/>
  </ChartWrapper>

}

export {StorageProviderBiggestAllocation};
