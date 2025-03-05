"use client";
import {ChartWrapper} from "@/app/compliance-data-portal/components/chart-wrapper";
import {StackedBarGraph} from "@/components/charts/compliance/graphs/stacked-bar-graph";
import {
  ResponsiveHoverCard,
  ResponsiveHoverCardContent,
  ResponsiveHoverCardTrigger,
} from "@/components/ui/responsive-hover-card";
import {Slider} from "@/components/ui/slider";
import {StatsLink} from "@/components/ui/stats-link";
import {useAllocatorSPComplianceChartData} from "@/lib/hooks/cdp.hooks";
import {useChartScale} from "@/lib/hooks/useChartScale";
import {dataTabs} from "@/lib/providers/cdp.provider";
import {gradientPalette} from "@/lib/utils";
import {InfoIcon} from "lucide-react";
import {usePathname} from "next/navigation";
import {useEffect, useState} from "react";
import {Checkbox} from "@/components/ui/checkbox";

interface Props {
  plain?: boolean;
}

const ProviderComplianceAllocator = ({plain}: Props) => {
  const pathName = usePathname();

  const [threshold, setThreshold] = useState(50);
  const [usePercentage, setUsePercentage] = useState(false);
  const [currentDataTab, setCurrentDataTab] = useState(dataTabs[0]);
  const [retrievabilityMetric, setRetrievabilityMetric] = useState(true)
  const [numberOfClientsMetric, setNumberOfClientsMetric] = useState(true)
  const [totalDealSizeMetric, setTotalDealSizeMetric] = useState(true)

  const {averageSuccessRate, chartData, isLoading} =
    useAllocatorSPComplianceChartData({
      threshold,
      asPercentage: usePercentage,
      mode: currentDataTab === "PiB" ? "dc" : "count",
      retrievabilityMetric,
      numberOfClientsMetric,
      totalDealSizeMetric
    });

  const {scale, selectedScale, calcPercentage, setSelectedScale} =
    useChartScale(10);

  useEffect(() => {
    setUsePercentage(calcPercentage);
  }, [calcPercentage]);

  const unit = currentDataTab === "Count" ? "allocator" : currentDataTab;

  return (
    <ChartWrapper
      title="Allocator Compliance based on % SP Compliance"
      id="ProviderComplianceAllocator"
      plain={plain}
      dataTabs={dataTabs}
      currentDataTab={currentDataTab}
      setCurrentDataTab={setCurrentDataTab}
      selectedScale={selectedScale}
      addons={[
        {
          name: "What are the metrics",
          size: 2,
          value: (
            <div>
              <ul>
                <p className="font-medium text-sm text-muted-foreground">
                  Allocator is complaint when it&apos;s SPs:
                </p>
                <li className="flex gap-1 items-center">
                  <Checkbox checked={retrievabilityMetric}
                            onCheckedChange={checked => setRetrievabilityMetric(!!checked)}/>
                  <p>
                    Have retrievability score above average{" "}
                    {averageSuccessRate
                      ? `(last week average: ${averageSuccessRate.toFixed(2)}%)`
                      : ""}
                    <StatsLink
                      className="ml-2"
                      href={`${
                        pathName.split("?")[0]
                      }?chart=RetrievabilityScoreAllocator`}
                    >
                      Retrievability
                    </StatsLink>
                  </p>
                </li>
                <li className="flex gap-1 items-center">
                  <Checkbox checked={numberOfClientsMetric}
                            onCheckedChange={checked => setNumberOfClientsMetric(!!checked)}/>
                  <p>
                    Have at least 3 clients
                  </p>
                </li>
                <li className="flex gap-1 items-center">
                  <Checkbox checked={totalDealSizeMetric}
                            onCheckedChange={checked => setTotalDealSizeMetric(!!checked)}/>
                  <p>
                    Has at most 30% of the DC coming from a single client
                    <StatsLink
                      className="ml-2"
                      href={`${
                        pathName.split("?")[0]
                      }?chart=BiggestDealsAllocator`}
                    >
                      Biggest allocation
                    </StatsLink>
                  </p>
                </li>
              </ul>
            </div>
          ),
        },
      ]}
      setSelectedScale={setSelectedScale}
      additionalFilters={[
        <ThresholdSelector
          key="threshold"
          threshold={threshold}
          setThreshold={setThreshold}
        />,
      ]}
    >
      <StackedBarGraph
        currentDataTab={currentDataTab}
        customPalette={gradientPalette("#4CAF50", "#FF5722", 3)}
        usePercentage={usePercentage}
        data={chartData}
        scale={scale}
        isLoading={isLoading}
        unit={unit}
      />
    </ChartWrapper>
  );
};

const ThresholdSelector = ({
                             threshold,
                             setThreshold,
                           }: {
  threshold: number;
  setThreshold: (val: number) => void;
}) => {
  return (
    <div className="flex flex-col">
      <div className="flex gap-1 items-center justify-between">
        Threshold: {threshold}%
        <ResponsiveHoverCard>
          <ResponsiveHoverCardTrigger>
            <InfoIcon className="w-5 h-5 text-muted-foreground"/>
          </ResponsiveHoverCardTrigger>
          <ResponsiveHoverCardContent>
            <p className="p-4 md:p-2 font-normal">
              Use this slider to adjust the threshold of SPs that need to be in
              compliance,
              <br/>
              <p className="text-muted-foreground">
                eg. 50% means that half of the SPs receiving DC through this
                allocator meet the compliance metrics
              </p>
            </p>
          </ResponsiveHoverCardContent>
        </ResponsiveHoverCard>
      </div>
      <Slider
        className="min-w-[150px]"
        value={[threshold]}
        max={100}
        min={5}
        step={5}
        onValueChange={(values) => setThreshold(values[0])}
      />
    </div>
  );
};

export {ProviderComplianceAllocator};
