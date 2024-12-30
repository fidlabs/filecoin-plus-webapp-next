import {StackedBarGraph} from "@/components/charts/compliance/graphs/stacked-bar-graph";
import {ChartWrapper} from "@/app/compliance-data-portal/components/chart-wrapper";
import {useCDPChartDataEngine} from "@/app/compliance-data-portal/hooks/useCDPChartDataEngine";
import {useStorageProviderRetrievability} from "@/lib/hooks/cdp.hooks";

interface Props {
  currentElement?: string;
  plain?: boolean;
}

const StorageProviderRetrievability = ({currentElement, plain}: Props) => {

  const {
    isLoading, usePercentage, chartData, currentTab, setCurrentTab, tabs, scale, selectedScale, setSelectedScale, palette
  } = useCDPChartDataEngine({
    fetchMethod: useStorageProviderRetrievability,
    unit: ' %',
  })

  if (!!currentElement && currentElement !==  'RetrievabilityScoreSP') {
    return null;
  }

  return <ChartWrapper
    title="Retrievability Score"
    tabs={tabs}
    plain={plain}
    currentTab={currentTab}
    setCurrentTab={setCurrentTab}
    id="RetrievabilityScoreSP"
    selectedScale={selectedScale}
    setSelectedScale={setSelectedScale}>
    <StackedBarGraph customPalette={palette} usePercentage={usePercentage} data={chartData} scale={scale} isLoading={isLoading} unit="provider"/>
  </ChartWrapper>

}

export {StorageProviderRetrievability};
