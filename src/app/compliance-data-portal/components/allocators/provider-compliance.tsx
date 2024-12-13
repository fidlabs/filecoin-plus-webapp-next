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
  const [usePercentage, setUsePercentage] = useState(false);

  const {
    chartData, isLoading
  } = useAllocatorSPSComplaince(threshold, usePercentage)

  const {top, ref} = useScrollObserver()
  const {scale, selectedScale, calcPercentage, setSelectedScale} = useChartScale(10)

  useEffect(() => {
    if (top > 0 && top < 300) {
      setCurrentElement('ProviderComplianceAllocator');
    }
  }, [setCurrentElement, top]);

  useEffect(() => {
    setUsePercentage(calcPercentage);
  }, [calcPercentage]);

  return <ChartWrapper
    title="SPs Compliance"
    id="ProviderComplianceAllocator"
    selectedScale={selectedScale}
    addons={[
      {
        name: 'What are the metrics',
        size: 2,
        value: <ul className="list-disc">
          <p>Allocator is complaint when it&apos;s SPs:</p>
          <li className="ml-4">Have retrievability score above average</li>
          <li className="ml-4">Have at least 3 clients</li>
          <li className="ml-4">Biggest client accounts for less than 30%</li>
        </ul>
      },
    ]}
    setSelectedScale={setSelectedScale}
    additionalFilters={[<ThresholdSelector key="threshold" threshold={threshold} setThreshold={setThreshold}/>]}
    ref={ref}>
    <StackedBarGraph customPalette={gradientPalette('#FF5722', '#4CAF50', 3)} usePercentage={usePercentage} data={chartData} scale={scale} isLoading={isLoading} unit="allocator"/>
  </ChartWrapper>

}

const ThresholdSelector = ({threshold, setThreshold}: { threshold: number, setThreshold: (val: number) => void }) => {
  return <div className="flex flex-col gap-2">
    <div>Threshold: {threshold}%</div>
    <Slider className="min-w-[150px]" value={[threshold]} max={100} min={5} step={5} onValueChange={(values) => setThreshold(values[0])}/>
  </div>
}

export default ProviderComplianceAllocator;
