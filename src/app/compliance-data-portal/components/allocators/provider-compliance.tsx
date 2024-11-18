import {StackedBarGraph} from "@/app/compliance-data-portal/components/graphs/stacked-bar-graph";
import {ChartWrapper} from "@/app/compliance-data-portal/components/chart-wrapper";
import {useAllocatorSPSComplaince} from "@/lib/hooks/cdp.hooks";
import {useScrollObserver} from "@/lib/hooks/useScrollObserver";
import {useChartScale} from "@/lib/hooks/useChartScale";
import {useEffect, useState} from "react";
import {Slider} from "@/components/ui/slider";
import {gradientPalette} from "@/lib/utils";

interface Props {
  setCurrentElement: (val: string) => void
}

const ProviderComplianceAllocator = ({setCurrentElement}: Props) => {

  const [threshold, setThreshold] = useState(50)

  const {
    chartData, isLoading
  } = useAllocatorSPSComplaince(threshold)

  const {top, ref} = useScrollObserver()
  const {scale, selectedScale, setSelectedScale} = useChartScale(10)

  useEffect(() => {
    if (top > 0 && top < 300) {
      setCurrentElement('ProviderComplianceAllocator');
    }
  }, [setCurrentElement, top]);

  return <ChartWrapper
    title="Retrievability Score"
    id="ProviderComplianceAllocator"
    selectedScale={selectedScale}
    setSelectedScale={setSelectedScale}
    additionalFilters={[<ThresholdSelector key="threshold" threshold={threshold} setThreshold={setThreshold}/>]}
    ref={ref}>
    <StackedBarGraph customPalette={gradientPalette('#FF5722', '#4CAF50', 3)} data={chartData} scale={scale} isLoading={isLoading} unit="provider"/>
  </ChartWrapper>

}

const ThresholdSelector = ({threshold, setThreshold}: { threshold: number, setThreshold: (val: number) => void }) => {
  return <div className="flex flex-col gap-2">
    <div>Threshold: {threshold}%</div>
    <Slider className="min-w-[150px]" value={[threshold]} max={100} min={5} step={5} onValueChange={(values) => setThreshold(values[0])}/>
  </div>
}

export default ProviderComplianceAllocator;
