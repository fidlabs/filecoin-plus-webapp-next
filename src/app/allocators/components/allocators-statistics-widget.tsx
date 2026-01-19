"use client";

import { DashboardStatisticDisplay } from "@/components/dashboard-statistic-display";
import { StatisticsHeading } from "@/components/statistics-heading";
import { QueryKey } from "@/lib/constants";
import { useDelayedFlag } from "@/lib/hooks/use-delayed-flag";
import { LoaderCircleIcon } from "lucide-react";
import { type HTMLAttributes, useEffect, useState } from "react";
import useSWR from "swr";
import {
  fetchAllocatorsDashboardStatistics,
  type FetchAllocatorsDashboardStatisticsParameters,
} from "../allocators-data";

export type AllocatorsStatisticsWidgetProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children"
>;
type Interval = NonNullable<
  FetchAllocatorsDashboardStatisticsParameters["interval"]
>;

export function AllocatorsStatisticsWidget(
  props: AllocatorsStatisticsWidgetProps
) {
  const [interval, setIntervalValue] = useState<Interval>("day");
  const { data, error, isLoading, mutate } = useSWR(
    [QueryKey.ALLOCATORS_DASHBOARD_STATISTICS, { interval }],
    ([, fetchParams]) => {
      return fetchAllocatorsDashboardStatistics(fetchParams);
    },
    { keepPreviousData: true, revalidateOnMount: false }
  );
  const statistics = data ?? [];
  const isLongLoading = useDelayedFlag(isLoading, 200);

  useEffect(() => {
    if (!data && !error) {
      mutate();
    }
  }, [data, error, mutate]);

  return (
    <div {...props}>
      <StatisticsHeading
        className="mb-2"
        selectedInterval={interval}
        onIntervalChange={setIntervalValue}
      />
      {!data && isLoading && (
        <div className="flex justify-center p-6">
          <LoaderCircleIcon
            size={48}
            className="animate-spin text-dodger-blue"
          />
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {statistics.map((statistic) => (
          <DashboardStatisticDisplay
            key={statistic.type}
            dashboardStatistic={statistic}
            showLoading={isLongLoading}
          />
        ))}
      </div>
    </div>
  );
}
