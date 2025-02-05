"use client"
import {useStorageProviderBiggestDeal} from "@/lib/hooks/cdp.hooks";
import {StackedBarGraph} from "@/components/charts/compliance/graphs/stacked-bar-graph";
import {ChartWrapper} from "@/app/compliance-data-portal/components/chart-wrapper";
import {useCDPChartDataEngine} from "@/app/compliance-data-portal/hooks/useCDPChartDataEngine";
import {barTabs, dataTabs} from "@/lib/providers/cdp.provider";

interface Props {
  currentElement?: string;
  plain?: boolean;
}

const StorageProviderBiggestAllocation = ({currentElement, plain}: Props) => {

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
    fetchMethod: useStorageProviderBiggestDeal,
    unit: ' %',
    paletteDirection: 'dsc'
  })

  if (!!currentElement && currentElement !== 'BiggestDealsSP') {
    return null;
  }

  const unit = currentDataTab === 'Count' ? 'provider' : currentDataTab;


  return <ChartWrapper
    title="Size Of The Biggest client allocation"
    tabs={barTabs}
    dataTabs={dataTabs}
    currentDataTab={currentDataTab}
    setCurrentDataTab={setCurrentDataTab}
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
    <StackedBarGraph customPalette={palette} data={chartData} usePercentage={usePercentage} scale={scale}
                     isLoading={isLoading} unit={unit}/>
  </ChartWrapper>

}

export {StorageProviderBiggestAllocation};
