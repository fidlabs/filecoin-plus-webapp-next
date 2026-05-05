import {
  SLIPerformanceChart,
  type SLIPerformanceChartProps,
} from "./sli-performance-chart";
import { startOfDay, sub } from "date-fns";

export type RPASLIWidgetProps = Omit<
  SLIPerformanceChartProps,
  "heading" | "description" | "data" | "averageUnit" | "averageLabel"
>;

const data: SLIPerformanceChartProps["data"] = [...new Array(20)].map(
  (_, index, array) => {
    const date = startOfDay(
      sub(new Date(), { days: array.length - index })
    ).toISOString();
    const total = 100 + Math.floor(index / 5);
    const passing = Math.round(total * 0.5 + variation(total * 0.1));
    const failing = total - passing;
    const average = 0.5 + variation(0.1);

    return {
      date,
      passing,
      failing,
      average,
    };
  }
);

function variation(max: number) {
  return Math.random() * max * (Math.random() >= 0.5 ? 1 : -1);
}

export function RPASLIWidget(props: RPASLIWidgetProps) {
  return (
    <SLIPerformanceChart
      {...props}
      heading="Random Piece Availability"
      description="Storage Providers fullfiling their SLA based on their RPA results"
      data={data}
      averageUnit="%"
      averageLabel="Average RPA"
    />
  );
}
