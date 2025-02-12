"use client"
import {StackedBarGraph} from "@/components/charts/compliance/graphs/stacked-bar-graph";
import {ChartWrapper} from "@/app/compliance-data-portal/components/chart-wrapper";
import {useCDPChartDataEngine} from "@/app/compliance-data-portal/hooks/useCDPChartDataEngine";
import {useStorageProviderRetrievability} from "@/lib/hooks/cdp.hooks";
import {barTabs, dataTabs} from "@/lib/providers/cdp.provider";
import {LoaderCircle} from "lucide-react";

interface Props {
  plain?: boolean;
}

const StorageProviderRetrievability = ({plain}: Props) => {

  const {
    isLoading,
    usePercentage,
    chartData,
    currentTab,
    setCurrentTab,
    scale,
    data,
    selectedScale,
    setSelectedScale,
    palette,
    currentDataTab,
    setCurrentDataTab,
  } = useCDPChartDataEngine({
    fetchMethod: useStorageProviderRetrievability,
    unit: ' %',
  })

  const unit = currentDataTab === 'Count' ? 'provider' : currentDataTab;

  return <ChartWrapper
    title="Retrievability Score"
    tabs={barTabs}
    dataTabs={dataTabs}
    currentDataTab={currentDataTab}
    setCurrentDataTab={setCurrentDataTab}
    plain={plain}
    currentTab={currentTab}
    setCurrentTab={setCurrentTab}
    id="RetrievabilityScoreSP"
    addons={[{
      name: 'All time average',
      value: !!data?.avgSuccessRatePct ? data?.avgSuccessRatePct.toFixed(2) + '%' : <LoaderCircle className="animate-spin"/>,
    }]}
    selectedScale={selectedScale}
    setSelectedScale={setSelectedScale}>
    <StackedBarGraph currentDataTab={currentDataTab} customPalette={palette} usePercentage={usePercentage} data={chartData} scale={scale} isLoading={isLoading} unit={unit}/>
  </ChartWrapper>

}

export {StorageProviderRetrievability};
