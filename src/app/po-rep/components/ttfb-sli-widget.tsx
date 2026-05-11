import {
  SLIPerformanceChart,
  type SLIPerformanceChartProps,
} from "./sli-performance-chart";
import { startOfDay, sub } from "date-fns";

export type TTFBSLIWidgetProps = Omit<
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
    const average = 5000 + Math.round(variation(1000));

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

export function TTFBSLIWidget(props: TTFBSLIWidgetProps) {
  return (
    <SLIPerformanceChart
      {...props}
      heading="Time to First Byte"
      description="Storage Providers fullfiling their SLA based on their TTFB measurments"
      data={data}
      averageUnit="Ms"
      averageLabel="Average TTFB"
    />
  );
}
