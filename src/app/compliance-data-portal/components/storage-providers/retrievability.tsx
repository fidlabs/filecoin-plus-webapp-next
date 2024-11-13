import {useScrollObserver} from "@/lib/hooks/useScrollObserver";
import {useStorageProviderRetrievability} from "@/lib/hooks/cdp.hooks";
import {useEffect} from "react";
import useWeeklyChartData from "@/app/compliance-data-portal/hooks/useWeeklyChartData";
import {useChartScale} from "@/lib/hooks/useChartScale";
import {StackedBarGraph} from "@/app/compliance-data-portal/components/graphs/stacked-bar-graph";
import {ChartWrapper} from "@/app/compliance-data-portal/components/chart-wrapper";

interface Props {
  setCurrentElement: (val: string) => void
}

const StorageProviderRetrievability = ({setCurrentElement}: Props) => {

  const {
    data, isLoading
  } = useStorageProviderRetrievability()

  const {top, ref} = useScrollObserver()
  const {chartData, currentTab, setCurrentTab, tabs, minValue} = useWeeklyChartData(data?.buckets, '%')
  const {scale} = useChartScale(minValue)

  useEffect(() => {
    if (top > 0 && top < 300) {
      setCurrentElement("RetrievabilityScoreSP");
    }
  }, [setCurrentElement, top]);

  return <ChartWrapper
    title="Retrievability Score"
    tabs={tabs}
    currentTab={currentTab}
    setCurrentTab={setCurrentTab}
    id="RetrievabilityScoreSP"
    ref={ref}>
    <StackedBarGraph data={chartData} scale={scale} isLoading={isLoading} unit="providers"/>
  </ChartWrapper>

}

export default StorageProviderRetrievability;
