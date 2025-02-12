
"use client"
import {StackedBarGraph} from "@/components/charts/compliance/graphs/stacked-bar-graph";
import {ChartWrapper} from "@/app/compliance-data-portal/components/chart-wrapper";
import {useAllocatorSPSComplaince} from "@/lib/hooks/cdp.hooks";
import {useChartScale} from "@/lib/hooks/useChartScale";
import {useEffect, useState} from "react";
import {Slider} from "@/components/ui/slider";
import {gradientPalette} from "@/lib/utils";
import {StatsLink} from "@/components/ui/stats-link";
import {usePathname} from "next/navigation";
import {
  ResponsiveHoverCard,
  ResponsiveHoverCardContent,
  ResponsiveHoverCardTrigger
} from "@/components/ui/responsive-hover-card";
import {InfoIcon} from "lucide-react";
import {dataTabs} from "@/lib/providers/cdp.provider";


interface Props {
  plain?: boolean;
}

const ProviderComplianceAllocator = ({plain}: Props) => {

  const pathName = usePathname()

  const [threshold, setThreshold] = useState(50)
  const [usePercentage, setUsePercentage] = useState(false);
  const [currentDataTab, setCurrentDataTab] = useState('Count');

  const {
    chartData, isLoading
  } = useAllocatorSPSComplaince(threshold, usePercentage)

  const {scale, selectedScale, calcPercentage, setSelectedScale} = useChartScale(10)

  useEffect(() => {
    setUsePercentage(calcPercentage);
  }, [calcPercentage]);

  const unit = currentDataTab === 'Count' ? 'allocator' : currentDataTab;

  return <ChartWrapper
    title="Allocator Compliance based on % SP Compliance"
    id="ProviderComplianceAllocator"
    plain={plain}
    dataTabs={dataTabs}
    currentDataTab={currentDataTab}
    setCurrentDataTab={setCurrentDataTab}
    selectedScale={selectedScale}
    addons={[
      {
        name: 'What are the metrics',
        size: 2,
        value: <div>
          <ul className="list-disc">
            <p className="font-medium text-sm text-muted-foreground">Allocator is complaint when it&apos;s SPs:</p>
            <li className="ml-4">
              Have retrievability score above average
              <StatsLink className="ml-2" href={`${pathName.split('?')[0]}?chart=RetrievabilityScoreAllocator`}>Retrievability</StatsLink>
            </li>
            <li className="ml-4">Have at least 3 clients</li>
            <li className="ml-4">
              Has at most 30% of the DC coming from a single client
              <StatsLink className="ml-2" href={`${pathName.split('?')[0]}?chart=BiggestDealsAllocator`}>Biggest allocation</StatsLink>
            </li>
          </ul>
        </div>
      },
    ]}
    setSelectedScale={setSelectedScale}
    additionalFilters={[<ThresholdSelector key="threshold" threshold={threshold} setThreshold={setThreshold}/>]}>
    <StackedBarGraph currentDataTab={currentDataTab} customPalette={gradientPalette('#FF5722', '#4CAF50', 3)} usePercentage={usePercentage}
                     data={chartData} scale={scale} isLoading={isLoading} unit={unit}/>
  </ChartWrapper>

}

const ThresholdSelector = ({threshold, setThreshold}: { threshold: number, setThreshold: (val: number) => void }) => {
  return <div className="flex flex-col">
    <div className="flex gap-1 items-center justify-between">
      Threshold: {threshold}%
      <ResponsiveHoverCard>
        <ResponsiveHoverCardTrigger>
          <InfoIcon className="w-5 h-5 text-muted-foreground"/>
        </ResponsiveHoverCardTrigger>
        <ResponsiveHoverCardContent>
          <p className="p-4 md:p-2 font-normal">Use this slider to adjust the threshold of SPs that need to be in compliance,
            <br/>
            <p className="text-muted-foreground">eg. 50% means that half of the SPs receiving DC through this allocator meet the compliance metrics</p>
          </p>
        </ResponsiveHoverCardContent>
      </ResponsiveHoverCard>
    </div>
    <Slider className="min-w-[150px]" value={[threshold]} max={100} min={5} step={5}
            onValueChange={(values) => setThreshold(values[0])}/>
  </div>
}


export {ProviderComplianceAllocator};
