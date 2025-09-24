"use client";

import { ChartWrapper } from "@/app/compliance-data-portal/components/chart-wrapper";
import { EditionRoundCheckbox } from "@/app/compliance-data-portal/components/edition-round-checkbox";
import { StackedBarGraph } from "@/app/compliance-data-portal/components/graphs/stacked-bar-graph";
import { Checkbox } from "@/components/ui/checkbox";
import { StatsLink } from "@/components/ui/stats-link";
import { useProvidersComplianceChartData } from "@/lib/hooks/cdp.hooks";
import { useChartScale } from "@/lib/hooks/useChartScale";
import { dataTabs } from "@/lib/providers/cdp.provider";
import { gradientPalette, isPlainObject } from "@/lib/utils";
import { safeWeekFromReadableString, weekToString } from "@/lib/weeks";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

const StorageProviderCompliance = () => {
  const { push } = useRouter();

  const { scale, selectedScale, calcPercentage, setSelectedScale } =
    useChartScale(10);

  const [dataTab, setDataTab] = useState(dataTabs[0]);
  const [retrievabilityMetric, setRetrievabilityMetric] = useState(true);
  const [numberOfClientsMetric, setNumberOfClientsMetric] = useState(true);
  const [totalDealSizeMetric, setTotalDealSizeMetric] = useState(true);

  const { averageSuccessRate, chartData, isLoading } =
    useProvidersComplianceChartData({
      mode: dataTab === "PiB" ? "dc" : "count",
      asPercentage: calcPercentage,
      retrievabilityMetric,
      numberOfClientsMetric,
      totalDealSizeMetric,
    });

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

      push(
        `/storage-providers/compliance/${weekString}?${searchParams.toString()}`
      );
    },
    [retrievabilityMetric, numberOfClientsMetric, totalDealSizeMetric, push]
  );

  return (
    <>
      <EditionRoundCheckbox />
      <ChartWrapper
        setSelectedScale={setSelectedScale}
        title="SPs Compliance"
        selectedScale={selectedScale}
        dataTabs={dataTabs}
        currentDataTab={dataTab}
        setCurrentDataTab={setDataTab}
        addons={[
          {
            name: "What are the metrics",
            size: 3,
            value: (
              <div>
                <ul>
                  <p className="font-medium text-sm text-muted-foreground">
                    SP is considered complaint when they:
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
                        href="/compliance-data-portal/storage-providers/retrievability"
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
                        href="/compliance-data-portal/storage-providers/client-diversity"
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
                        href="/compliance-data-portal/storage-providers/biggest-deals"
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
      >
        <p className="text-sm text-center text-muted-foreground mb-4">
          Click on a bar to see a list of Service Providers for that time
          period, matching selected criteria.
        </p>
        <StackedBarGraph
          currentDataTab={dataTab}
          customPalette={gradientPalette("#4CAF50", "#FF5722", 3)}
          usePercentage={calcPercentage}
          data={chartData}
          scale={scale}
          isLoading={isLoading}
          unit={dataTab === "PiB" ? "PiB" : "compliant SP"}
          onBarClick={handleBarClick}
        />
      </ChartWrapper>
    </>
  );
};

export default StorageProviderCompliance;
