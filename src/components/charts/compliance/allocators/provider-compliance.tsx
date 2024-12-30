import {StackedBarGraph} from "@/components/charts/compliance/graphs/stacked-bar-graph";
import {ChartWrapper} from "@/app/compliance-data-portal/components/chart-wrapper";
import {useAllocatorSPSComplaince} from "@/lib/hooks/cdp.hooks";
import {useChartScale} from "@/lib/hooks/useChartScale";
import {useEffect, useState} from "react";
import {Slider} from "@/components/ui/slider";
import {gradientPalette} from "@/lib/utils";


interface Props {
  currentElement?: string;
  plain?: boolean;
}

const ProviderComplianceAllocator = ({currentElement, plain}: Props) => {

  const [threshold, setThreshold] = useState(50)
  const [usePercentage, setUsePercentage] = useState(false);

  const {
    chartData, isLoading
  } = useAllocatorSPSComplaince(threshold, usePercentage)

  const {scale, selectedScale, calcPercentage, setSelectedScale} = useChartScale(10)

  useEffect(() => {
    setUsePercentage(calcPercentage);
  }, [calcPercentage]);

  if (!!currentElement && currentElement !==  'ProviderComplianceAllocator') {
    return null;
  }

  return <ChartWrapper
    title="SPs Compliance"
    id="ProviderComplianceAllocator"
    plain={plain}
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
    additionalFilters={[<ThresholdSelector key="threshold" threshold={threshold} setThreshold={setThreshold}/>]}>
    <StackedBarGraph customPalette={gradientPalette('#FF5722', '#4CAF50', 3)} usePercentage={usePercentage} data={chartData} scale={scale} isLoading={isLoading} unit="allocator"/>
  </ChartWrapper>

}

const ThresholdSelector = ({threshold, setThreshold}: { threshold: number, setThreshold: (val: number) => void }) => {
  return <div className="flex flex-col gap-2">
    <div>Threshold: {threshold}%</div>
    <Slider className="min-w-[150px]" value={[threshold]} max={100} min={5} step={5} onValueChange={(values) => setThreshold(values[0])}/>
  </div>
}


export {ProviderComplianceAllocator};
