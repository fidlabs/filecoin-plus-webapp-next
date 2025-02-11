"use client"
import {StackedBarGraph} from "@/components/charts/compliance/graphs/stacked-bar-graph";
import {ChartWrapper} from "@/app/compliance-data-portal/components/chart-wrapper";
import {useCDPChartDataEngine} from "@/app/compliance-data-portal/hooks/useCDPChartDataEngine";
import {useStorageProviderRetrievability} from "@/lib/hooks/cdp.hooks";
import {barTabs, dataTabs} from "@/lib/providers/cdp.provider";

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
    selectedScale={selectedScale}
    setSelectedScale={setSelectedScale}>
    <StackedBarGraph customPalette={palette} usePercentage={usePercentage} data={chartData} scale={scale} isLoading={isLoading} unit={unit}/>
  </ChartWrapper>

}

export {StorageProviderRetrievability};
