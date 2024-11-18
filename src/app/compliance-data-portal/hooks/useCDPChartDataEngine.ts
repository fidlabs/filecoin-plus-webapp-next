import {useScrollObserver} from "@/lib/hooks/useScrollObserver";
import useWeeklyChartData from "@/app/compliance-data-portal/hooks/useWeeklyChartData";
import {useChartScale} from "@/lib/hooks/useChartScale";
import {useEffect} from "react";
import {ICDPUnifiedHistogram} from "@/lib/interfaces/cdp/cdp.interface";

type FetchMethod = () => {
  data: ICDPUnifiedHistogram | undefined;
  isLoading: boolean;
}

interface ChartEngineOptions {
  fetchMethod: FetchMethod;
  setCurrentElement: (val: string) => void;
  id: string;
  unit?: string;
  paletteDirection?: 'dsc' | 'asc';
}

const useCDPChartDataEngine = ({fetchMethod, paletteDirection = 'asc', unit, id, setCurrentElement}: ChartEngineOptions) => {

  const {
    data, isLoading
  } = fetchMethod()

  const {top, ref} = useScrollObserver()
  const {chartData, currentTab, setCurrentTab, tabs, minValue, palette} = useWeeklyChartData({
    data: data?.buckets,
    unit,
    paletteDirection
  })
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
    palette
  }

}

export {useCDPChartDataEngine}