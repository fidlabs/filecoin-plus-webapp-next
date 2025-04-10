"use client";
import { ChartWrapper } from "@/app/compliance-data-portal/components/chart-wrapper";
import { StackedBarGraph } from "@/app/compliance-data-portal/components/graphs/stacked-bar-graph";
import {
  ResponsiveHoverCard,
  ResponsiveHoverCardContent,
  ResponsiveHoverCardTrigger,
} from "@/components/ui/responsive-hover-card";
import { Slider } from "@/components/ui/slider";
import { useAllocatorAndSPClientDiversity } from "@/lib/hooks/cdp.hooks";
import { useChartScale } from "@/lib/hooks/useChartScale";
import { dataTabs } from "@/lib/providers/cdp.provider";
import { gradientPalette } from "@/lib/utils";
import { InfoIcon } from "lucide-react";
import { useEffect, useState } from "react";

const ClientDiversityAllocator = () => {
  const [threshold, setThreshold] = useState([3, 10]);
  const [usePercentage, setUsePercentage] = useState(false);
  const [currentDataTab, setCurrentDataTab] = useState(dataTabs[0]);

  const { chartData, isLoading } = useAllocatorAndSPClientDiversity({
    threshold,
    apiMode: "allocators",
    asPercentage: usePercentage,
    mode: currentDataTab === "PiB" ? "dc" : "count",
  });

  const { scale, selectedScale, calcPercentage, setSelectedScale } =
    useChartScale(10);

  useEffect(() => {
    setUsePercentage(calcPercentage);
  }, [calcPercentage]);

  const unit = currentDataTab === "Count" ? "allocator" : currentDataTab;

  return (
    <ChartWrapper
      title="Allocator Client Diversity"
      id="ClientDiversityAllocator"
      dataTabs={dataTabs}
      currentDataTab={currentDataTab}
      setCurrentDataTab={setCurrentDataTab}
      selectedScale={selectedScale}
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
        customPalette={gradientPalette("#FF5722", "#4CAF50", 3)}
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
  threshold: number[];
  setThreshold: (val: number[]) => void;
}) => {
  return (
    <div className="flex flex-col">
      <div className="flex gap-1 items-center justify-between">
        Threshold: {threshold[0]} - {threshold[1]}
        <ResponsiveHoverCard>
          <ResponsiveHoverCardTrigger>
            <InfoIcon className="w-5 h-5 text-muted-foreground" />
          </ResponsiveHoverCardTrigger>
          <ResponsiveHoverCardContent>
            <div className="p-4 md:p-2 font-normal">
              Use this slider to adjust the ranges for the client count for
              allocator
              <br />
              <div className="text-muted-foreground">
                eg. {threshold[0]}-{threshold[1]} range means that:
                <ul className="list-disc">
                  <li className="m-4">
                    0-{threshold[0]} clients will be marked as low client
                    diversity
                  </li>
                  <li className="m-4">
                    {threshold[0]}-{threshold[1]} clients will be marked as
                    medium client diversity
                  </li>
                  <li className="m-4">
                    {threshold[1]}+ clients will be marked as high client
                    diversity
                  </li>
                </ul>
              </div>
            </div>
          </ResponsiveHoverCardContent>
        </ResponsiveHoverCard>
      </div>
      <Slider
        className="min-w-[250px]"
        value={threshold}
        max={25}
        min={1}
        step={1}
        onValueChange={(values) => setThreshold(values)}
      />
    </div>
  );
};

export default ClientDiversityAllocator;
