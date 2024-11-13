import {useScrollObserver} from "@/lib/hooks/useScrollObserver";
import useWeeklyChartData from "@/app/compliance-data-portal/hooks/useWeeklyChartData";
import {useChartScale} from "@/lib/hooks/useChartScale";
import {useEffect} from "react";
import {ICDPUnifiedHistogram} from "@/lib/interfaces/cdp/cdp.interface";

type FetchMethod = () => {
  data: ICDPUnifiedHistogram | undefined;
  isLoading: boolean;
}

const useCDPChartDataEngine = (fetchMethod: FetchMethod, setCurrentElement: (val: string) => void, id: string, unit = '') => {

  const {
    data, isLoading
  } = fetchMethod()

  const {top, ref} = useScrollObserver()
  const {chartData, currentTab, setCurrentTab, tabs, minValue} = useWeeklyChartData(data?.buckets, unit)
  const {scale, selectedScale, setSelectedScale} = useChartScale(minValue)

  useEffect(() => {
    if (top > 0 && top < 300) {
      setCurrentElement(id);
    }
  }, [id, setCurrentElement, top]);

  return {
    chartData,
    currentTab,
    setCurrentTab,
    tabs,
    selectedScale,
    setSelectedScale,
    scale,
    ref,
    isLoading: isLoading || !data,
    data,
  }

}

export {useCDPChartDataEngine}