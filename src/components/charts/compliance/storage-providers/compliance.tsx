"use client";

import { ChartWrapper } from "@/app/compliance-data-portal/components/chart-wrapper";
import { StackedBarGraph } from "@/components/charts/compliance/graphs/stacked-bar-graph";
import { StatsLink } from "@/components/ui/stats-link";
import { useProvidersComplianceChartData } from "@/lib/hooks/cdp.hooks";
import { useChartScale } from "@/lib/hooks/useChartScale";
import { gradientPalette } from "@/lib/utils";
import { usePathname } from "next/navigation";

interface Props {
  plain?: boolean;
}

export function StorageProviderCompliance({ plain }: Props) {
  const pathName = usePathname();
  const { scale, selectedScale, calcPercentage, setSelectedScale } =
    useChartScale(10);
  const { chartData, isLoading } = useProvidersComplianceChartData({
    mode: calcPercentage ? "percentage" : "default",
  });

  return (
    <ChartWrapper
      title="SPs Compliance"
      plain={plain}
      selectedScale={selectedScale}
      addons={[
        {
          name: "What are the metrics",
          size: 2,
          value: (
            <div>
              <ul className="list-disc">
                <p className="font-medium text-sm text-muted-foreground">
                  SP is considered complaint when they:
                </p>
                <li className="ml-4">
                  Have retrievability score above average
                  <StatsLink
                    className="ml-2"
                    href={`${
                      pathName.split("?")[0]
                    }?chart=RetrievabilityScoreSP`}
                  >
                    Retrievability
                  </StatsLink>
                </li>
                <li className="ml-4">Have at least 3 clients</li>
                <li className="ml-4">
                  Has at most 30% of the DC coming from a single client
                  <StatsLink
                    className="ml-2"
                    href={`${
                      pathName.split("?")[0]
                    }?chart=BiggestDealsSP`}
                  >
                    Biggest allocation
                  </StatsLink>
                </li>
              </ul>
            </div>
          ),
        },
      ]}
      setSelectedScale={setSelectedScale}
    >
      <StackedBarGraph
        customPalette={gradientPalette("#4CAF50", "#FF5722", 3)}
        usePercentage={calcPercentage}
        data={chartData}
        scale={scale}
        isLoading={isLoading}
        unit="compliant SP"
      />
    </ChartWrapper>
  );
}
