"use client";

import { DashboardStatisticDisplay } from "@/components/dashboard-statistic-display";
import { StatisticsHeading } from "@/components/statistics-heading";
import { QueryKey } from "@/lib/constants";
import { useDelayedFlag } from "@/lib/hooks/use-delayed-flag";
import { useEffect, useState } from "react";
import useSWR from "swr";
import {
  fetchDashboardStatistics,
  FetchDashboardStatisticsParameters,
} from "../dashboard-data";
import { LoaderCircleIcon } from "lucide-react";

type Interval = NonNullable<FetchDashboardStatisticsParameters["interval"]>;

export function DashboardStatistics() {
  const [interval, setIntervalValue] = useState<Interval>("day");
  const { data, error, isLoading, mutate } = useSWR(
    [QueryKey.DASHBOARD_STATISTICS, { interval }],
    ([, fetchParams]) => {
      return fetchDashboardStatistics(fetchParams);
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
    <div>
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
