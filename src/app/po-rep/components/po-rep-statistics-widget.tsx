"use client";

import { DashboardStatisticDisplay } from "@/components/dashboard-statistic-display";
import { StatisticsHeading } from "@/components/statistics-heading";
import { QueryKey } from "@/lib/constants";
import { useDelayedFlag } from "@/lib/hooks/use-delayed-flag";
import { PoRepDashboardStatistic } from "@/lib/schemas";
import { LoaderCircleIcon } from "lucide-react";
import { type HTMLAttributes, useState } from "react";
import useSWR from "swr";
import {
  fetchPoRepDashboardStatistics,
  FetchPoRepDashboardStatisticsParameters,
} from "../po-rep-data";

export type PoRepStatisticsWidgetProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children"
>;
type Interval = NonNullable<
  PoRepDashboardStatistic["percentageChange"]
>["interval"];

export function PoRepStatisticsWidget(props: PoRepStatisticsWidgetProps) {
  const [interval, setIntervalValue] = useState<Interval>("day");
  const parameters: FetchPoRepDashboardStatisticsParameters = {
    interval,
  };

  const { data, error, isLoading } = useSWR(
    [QueryKey.PO_REP_STATISTICS, parameters],
    ([, fetchParameters]) => {
      return fetchPoRepDashboardStatistics(fetchParameters);
    },
    {
      keepPreviousData: true,
    }
  );
  const isLongLoading = useDelayedFlag(isLoading, 200);
  const statistics = data ?? [];

  return (
    <div {...props}>
      <StatisticsHeading
        className="mb-2"
        selectedInterval={interval}
        onIntervalChange={setIntervalValue}
      />
      {isLoading && (
        <div className="flex justify-center p-6">
          <LoaderCircleIcon
            size={48}
            className="animate-spin text-dodger-blue"
          />
        </div>
      )}

      {!isLoading && !!error && (
        <p className="text-sm text-muted-foreground text-center">
          An error has occured while loading the data. Please try again later.
        </p>
      )}

      {!isLoading && !error && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {statistics.map((statistic) => (
            <DashboardStatisticDisplay
              key={statistic.type}
              dashboardStatistic={statistic}
              showLoading={isLongLoading}
            />
          ))}
        </div>
      )}
    </div>
  );
}
