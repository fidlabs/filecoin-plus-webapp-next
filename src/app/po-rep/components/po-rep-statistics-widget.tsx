"use client";

import { DashboardStatisticDisplay } from "@/components/dashboard-statistic-display";
import { StatisticsHeading } from "@/components/statistics-heading";
import { useDelayedFlag } from "@/lib/hooks/use-delayed-flag";
import {
  PoRepDashboardStatistic,
  PoRepDashboardStatisticType,
} from "@/lib/schemas";
import { LoaderCircleIcon } from "lucide-react";
import { type HTMLAttributes, useState } from "react";

export type PoRepStatisticsWidgetProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children"
>;
type Interval = NonNullable<
  PoRepDashboardStatistic["percentageChange"]
>["interval"];

export function PoRepStatisticsWidget(props: PoRepStatisticsWidgetProps) {
  const [interval, setIntervalValue] = useState<Interval>("day");
  const statistics: PoRepDashboardStatistic[] = [
    {
      type: PoRepDashboardStatisticType.TOTAL_DEALS_DONE,
      title: "Total Deals Done",
      description: null,
      value: {
        type: "numeric",
        value: 1234,
      },
      percentageChange: {
        value: 0.1234,
        interval,
        increaseNegative: false,
      },
    },
    {
      type: PoRepDashboardStatisticType.TOTAL_FIL_PAID,
      title: "Total FIL Paid",
      description: null,
      value: {
        type: "numeric",
        value: 4321,
      },
      percentageChange: {
        value: 0.4321,
        interval,
        increaseNegative: false,
      },
    },
  ];
  const isLoading = false;
  const isLongLoading = useDelayedFlag(isLoading, 200);

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
