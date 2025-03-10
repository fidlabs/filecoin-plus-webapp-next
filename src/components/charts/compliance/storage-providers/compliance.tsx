"use client";

import {ChartWrapper} from "@/app/compliance-data-portal/components/chart-wrapper";
import {StackedBarGraph} from "@/components/charts/compliance/graphs/stacked-bar-graph";
import {StatsLink} from "@/components/ui/stats-link";
import {useProvidersComplianceChartData} from "@/lib/hooks/cdp.hooks";
import {useChartScale} from "@/lib/hooks/useChartScale";
import {dataTabs} from "@/lib/providers/cdp.provider";
import {gradientPalette} from "@/lib/utils";
import {usePathname} from "next/navigation";
import {useState} from "react";
import {Checkbox} from "@/components/ui/checkbox";

interface Props {
  plain?: boolean;
}

export function StorageProviderCompliance({plain}: Props) {
  const pathName = usePathname();

  const {scale, selectedScale, calcPercentage, setSelectedScale} =
    useChartScale(10);

  const [dataTab, setDataTab] = useState(dataTabs[0]);
  const [retrievabilityMetric, setRetrievabilityMetric] = useState(true)
  const [numberOfClientsMetric, setNumberOfClientsMetric] = useState(true)
  const [totalDealSizeMetric, setTotalDealSizeMetric] = useState(true)


  const {averageSuccessRate, chartData, isLoading} = useProvidersComplianceChartData({
    mode: dataTab === "PiB" ? "dc" : "count",
    asPercentage: calcPercentage,
    retrievabilityMetric,
    numberOfClientsMetric,
    totalDealSizeMetric
  });

  return (
    <ChartWrapper
      setSelectedScale={setSelectedScale}
      title="SPs Compliance"
      plain={plain}
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
                  <Checkbox checked={retrievabilityMetric} onCheckedChange={checked => setRetrievabilityMetric(!!checked)}/>
                  <p>
                    Have retrievability score above average{" "}
                    {averageSuccessRate
                      ? `(last week average: ${averageSuccessRate.toFixed(2)}%)`
                      : ""}
                    <StatsLink
                      className="ml-2"
                      href={`${
                        pathName.split("?")[0]
                      }?chart=RetrievabilityScoreSP`}
                    >
                      Retrievability
                    </StatsLink>
                  </p>
                </li>
                <li className="flex gap-1 items-center">
                  <Checkbox checked={numberOfClientsMetric} onCheckedChange={checked => setNumberOfClientsMetric(!!checked)}/>
                  <p>
                    Have at least 3 clients
                    <StatsLink
                      className="ml-2"
                      href={`${
                        pathName.split("?")[0]
                      }?chart=ClientDiversitySP`}
                    >
                      Client Diversity
                    </StatsLink>
                  </p>
                </li>
                <li className="flex gap-1 items-center">
                  <Checkbox checked={totalDealSizeMetric} onCheckedChange={checked => setTotalDealSizeMetric(!!checked)}/>
                  <p>
                    Has at most 30% of the DC coming from a single client
                    <StatsLink
                      className="ml-2"
                      href={`${pathName.split("?")[0]}?chart=BiggestDealsSP`}
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
    >
      <StackedBarGraph
        currentDataTab={dataTab}
        customPalette={gradientPalette("#4CAF50", "#FF5722", 3)}
        usePercentage={calcPercentage}
        data={chartData}
        scale={scale}
        isLoading={isLoading}
        unit={dataTab === "PiB" ? "PiB" : "compliant SP"}
      />
    </ChartWrapper>
  );
}
