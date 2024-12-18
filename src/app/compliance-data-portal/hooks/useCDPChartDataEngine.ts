import useWeeklyChartData from "@/app/compliance-data-portal/hooks/useWeeklyChartData";
import {useChartScale} from "@/lib/hooks/useChartScale";
import {useEffect, useState} from "react";
import {ICDPUnifiedHistogram} from "@/lib/interfaces/cdp/cdp.interface";

type FetchMethod = (param?: boolean) => {
  data: ICDPUnifiedHistogram | undefined;
  isLoading: boolean;
}

interface ChartEngineOptions {
  fetchMethod: FetchMethod;
  unit?: string;
  paletteDirection?: 'dsc' | 'asc';
}

const useCDPChartDataEngine = ({fetchMethod, paletteDirection = 'asc', unit}: ChartEngineOptions) => {

  const [usePercentage, setUsePercentage] = useState(false);

  const {
    data, isLoading
  } = fetchMethod()

  const {chartData, currentTab, setCurrentTab, tabs, minValue, palette} = useWeeklyChartData({
    data: data?.buckets,
    unit,
    paletteDirection,
    usePercentage
  })

  const {scale, calcPercentage, selectedScale, setSelectedScale} = useChartScale(minValue)

  useEffect(() => {
    setUsePercentage(calcPercentage);
  }, [calcPercentage]);

  return {
    chartData,
    currentTab,
    setCurrentTab,
    tabs,
    selectedScale,
    setSelectedScale,
    scale,
    usePercentage,
    calcPercentage,
    isLoading: isLoading || !data,
    data,
    palette
  }

}

export {useCDPChartDataEngine}