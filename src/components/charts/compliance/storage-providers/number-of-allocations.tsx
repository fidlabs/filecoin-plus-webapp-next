"use client"
import {useStorageProviderNumberOfDeals} from "@/lib/hooks/cdp.hooks";
import {StackedBarGraph} from "@/components/charts/compliance/graphs/stacked-bar-graph";
import {ChartWrapper} from "@/app/compliance-data-portal/components/chart-wrapper";
import {useCDPChartDataEngine} from "@/app/compliance-data-portal/hooks/useCDPChartDataEngine";

interface Props {
  currentElement?: string;
  plain?: boolean;
}

const StorageProviderNumberOfAllocations = ({currentElement, plain}: Props) => {

  const {
    isLoading, usePercentage, chartData, currentTab, setCurrentTab, tabs, scale, selectedScale, setSelectedScale, data, palette
  } = useCDPChartDataEngine({
    fetchMethod: useStorageProviderNumberOfDeals,
    unit: ' clients'
  })

  if (!!currentElement && currentElement !==  'NumberOfDealsSP') {
    return null;
  }

  return <ChartWrapper
    title="Number of allocations"
    tabs={tabs}
    plain={plain}
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
    }]}>
    <StackedBarGraph customPalette={palette} usePercentage={usePercentage} data={chartData} scale={scale} isLoading={isLoading} unit="provider"/>
  </ChartWrapper>

}

export {StorageProviderNumberOfAllocations};
