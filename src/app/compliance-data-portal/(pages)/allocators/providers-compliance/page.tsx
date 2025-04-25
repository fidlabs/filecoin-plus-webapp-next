"use client";

import { ChartWrapper } from "@/app/compliance-data-portal/components/chart-wrapper";
import { StackedBarGraph } from "@/app/compliance-data-portal/components/graphs/stacked-bar-graph";
import { AllocatorsComplianceThresholdSelector } from "@/components/allocators-compliance-threshold-selector";
import { Checkbox } from "@/components/ui/checkbox";
import { StatsLink } from "@/components/ui/stats-link";
import { useAllocatorSPComplianceChartData } from "@/lib/hooks/cdp.hooks";
import { useChartScale } from "@/lib/hooks/useChartScale";
import { dataTabs } from "@/lib/providers/cdp.provider";
import { gradientPalette, isPlainObject } from "@/lib/utils";
import { safeWeekFromReadableString, weekToString } from "@/lib/weeks";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function ProviderComplianceAllocator() {
  const pathName = usePathname();
  const { push } = useRouter();

  const [threshold, setThreshold] = useState(50);
  const [usePercentage, setUsePercentage] = useState(false);
  const [currentDataTab, setCurrentDataTab] = useState(dataTabs[0]);
  const [retrievabilityMetric, setRetrievabilityMetric] = useState(true);
  const [numberOfClientsMetric, setNumberOfClientsMetric] = useState(true);
  const [totalDealSizeMetric, setTotalDealSizeMetric] = useState(true);

  const { averageSuccessRate, chartData, isLoading } =
    useAllocatorSPComplianceChartData({
      threshold,
      asPercentage: usePercentage,
      mode: currentDataTab === "PiB" ? "dc" : "count",
      retrievabilityMetric,
      numberOfClientsMetric,
      totalDealSizeMetric,
    });

  const { scale, selectedScale, calcPercentage, setSelectedScale } =
    useChartScale(10);

  const handleBarClick = useCallback(
    (data: unknown) => {
      if (!isPlainObject(data)) {
        return;
      }

      const searchParams = new URLSearchParams();
      const week = safeWeekFromReadableString(data.name);
      const weekString = week ? weekToString(week) : "latest";

      if (
        Array.isArray(data.tooltipPayload) &&
        typeof data.tooltipPayload[0]?.dataKey === "string"
      ) {
        searchParams.set("complianceScore", data.tooltipPayload[0].dataKey);
      }

      searchParams.set("retrievability", String(retrievabilityMetric));
      searchParams.set("numberOfClients", String(numberOfClientsMetric));
      searchParams.set("totalDealSize", String(totalDealSizeMetric));
      searchParams.set("complianceThresholdPercentage", String(threshold));

      push(`/allocators/compliance/${weekString}?${searchParams.toString()}`);
    },
    [
      retrievabilityMetric,
      numberOfClientsMetric,
      push,
      threshold,
      totalDealSizeMetric,
    ]
  );

  useEffect(() => {
    setUsePercentage(calcPercentage);
  }, [calcPercentage]);

  const unit = currentDataTab === "Count" ? "allocator" : currentDataTab;

  return (
    <ChartWrapper
      title="Allocator Compliance based on % SP Compliance"
      id="ProviderComplianceAllocator"
      dataTabs={dataTabs}
      currentDataTab={currentDataTab}
      setCurrentDataTab={setCurrentDataTab}
      selectedScale={selectedScale}
      addons={[
        {
          name: "What are the metrics",
          size: 3,
          value: (
            <div>
              <ul>
                <p className="font-medium text-sm text-muted-foreground">
                  Allocator is complaint when it&apos;s SPs:
                </p>
                <li className="flex gap-1 items-center">
                  <Checkbox
                    checked={retrievabilityMetric}
                    onCheckedChange={(checked) =>
                      setRetrievabilityMetric(!!checked)
                    }
                  />
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
                  <Checkbox
                    checked={numberOfClientsMetric}
                    onCheckedChange={(checked) =>
                      setNumberOfClientsMetric(!!checked)
                    }
                  />
                  <p>
                    Have at least 3 clients
                    <StatsLink
                      className="ml-2"
                      href={`${
                        pathName.split("?")[0]
                      }?chart=ClientDiversityAllocator`}
                    >
                      Client Diversity
                    </StatsLink>
                  </p>
                </li>
                <li className="flex gap-1 items-center">
                  <Checkbox
                    checked={totalDealSizeMetric}
                    onCheckedChange={(checked) =>
                      setTotalDealSizeMetric(!!checked)
                    }
                  />
                  <p>
                    Has at most 30% of the DC coming from a single client
                    <StatsLink
                      className="ml-2"
                      href={`${
                        pathName.split("?")[0]
                      }?chart=BiggestDealsAllocator`}
                    >
                      Biggest Allocation
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
        <AllocatorsComplianceThresholdSelector
          key="threshold"
          value={threshold}
          onThresholdChange={setThreshold}
        />,
      ]}
    >
      <p className="text-sm text-center text-muted-foreground mb-4">
        Click on a bar to see a list of Allocators for that time period,
        matching selected criteria.
      </p>
      <StackedBarGraph
        currentDataTab={currentDataTab}
        customPalette={gradientPalette("#4CAF50", "#FF5722", 3)}
        usePercentage={usePercentage}
        data={chartData}
        scale={scale}
        isLoading={isLoading}
        unit={unit}
        onBarClick={handleBarClick}
      />
    </ChartWrapper>
  );
}
