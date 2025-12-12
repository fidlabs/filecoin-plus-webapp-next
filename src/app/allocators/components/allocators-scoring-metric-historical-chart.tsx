import { ChartTooltip } from "@/components/chart-tooltip";
import { cn } from "@/lib/utils";
import { weekFromDate, weekToReadableString } from "@/lib/weeks";
import { UTCDate } from "@date-fns/utc";
import { startOfMonth, startOfWeek, sub } from "date-fns";
import { filesize } from "filesize";
import { type HTMLAttributes, useCallback, useMemo } from "react";
import {
  Area,
  Bar,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { type FetchAllocatorsScoringBreakdownReturnType } from "../allocators-data";

type Interval = "month" | "week";
type DataItem =
  FetchAllocatorsScoringBreakdownReturnType[number]["data"][number];
type ChartEntry = Pick<DataItem, "date"> & Partial<Omit<DataItem, "date">>;
type Param = Exclude<
  keyof ChartEntry,
  | "date"
  | "scoreLowAllocators"
  | "scoreMediumAllocators"
  | "scoreHighAllocators"
>;

export interface AllocatorsScoringMetricHistoricalChartProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  animationDuration?: number;
  metricDescription: string;
  metricName: string;
  data: ChartEntry[];
  disableSync?: boolean;
  interval: Interval;
  minIntervalsCount?: number;
  mode?: "count" | "datacap";
  chartType?: "area" | "bar";
}

const onePiB = 1024n ** 5n;
const datacapPrecisionDivider = 10000;
const colors = ["#ff0029", "orange", "#66a61e"];
const paramsDict: Record<Param, string> = {
  scoreLowAllocatorsCount: "Low Score Allocators",
  scoreMediumAllocatorsCount: "Medium Score Allocators",
  scoreHighAllocatorsCount: "High Score Allocators",
  scoreLowAllocatorsDatacap: "Low Score DC",
  scoreMediumAllocatorsDatacap: "Medium Score DC",
  scoreHighAllocatorsDatacap: "High Score DC",
};

export function AllocatorsScoringMetricHistoricalChart({
  animationDuration,
  metricDescription,
  metricName,
  chartType = "bar",
  className,
  data,
  disableSync = false,
  interval,
  minIntervalsCount = 0,
  mode = "datacap",
  style,
  ...rest
}: AllocatorsScoringMetricHistoricalChartProps) {
  const chartData = useMemo(() => {
    if (data.length >= minIntervalsCount) {
      return data.toReversed().slice(-minIntervalsCount);
    }

    const now = new UTCDate();
    const startDate =
      interval === "week" ? startOfWeek(now) : startOfMonth(now);

    return [...Array(minIntervalsCount)]
      .map<ChartEntry>((_, index) => {
        const dataEntry = data[index];

        if (dataEntry) {
          return dataEntry;
        }

        return {
          date: sub(startDate, {
            months: interval === "month" ? index : undefined,
            weeks: interval === "week" ? index : undefined,
          }).toISOString(),
        };
      })
      .reverse();
  }, [data, interval, minIntervalsCount]);

  const formatDate = useCallback(
    (value: unknown) => {
      if (typeof value !== "string") {
        return String(value);
      }

      if (interval === "week") {
        return weekToReadableString(weekFromDate(value));
      }

      return new UTCDate(value).toLocaleString("en-US", {
        month: "short",
        year: "numeric",
      });
    },
    [interval]
  );

  const params = useMemo<Param[]>(() => {
    return mode === "count"
      ? [
          "scoreLowAllocatorsCount",
          "scoreMediumAllocatorsCount",
          "scoreHighAllocatorsCount",
        ]
      : [
          "scoreLowAllocatorsDatacap",
          "scoreMediumAllocatorsDatacap",
          "scoreHighAllocatorsDatacap",
        ];
  }, [mode]);

  const toIEC = useCallback((value: unknown) => {
    if (typeof value !== "string" && typeof value !== "number") {
      return String(value);
    }

    return filesize(value, { standard: "iec" });
  }, []);

  const toPiBs = useCallback((value: unknown) => {
    if (typeof value !== "string" && typeof value !== "number") {
      return String(value);
    }

    const valueInPiBsWithPrecision =
      (BigInt(value) * BigInt(datacapPrecisionDivider)) / onePiB;
    const valueInPiBs =
      Number(valueInPiBsWithPrecision) / datacapPrecisionDivider;
    return parseFloat(valueInPiBs.toFixed(0)).toString();
  }, []);

  return (
    <article
      {...rest}
      className={cn("border p-4 flex-1", className)}
      style={{
        minWidth: "min(600px, 100%)",
        ...style,
      }}
    >
      <header className="mb-1">
        <h5 className="text-sm font-semibold">{metricName}</h5>
        <p className="text-xs text-muted-foreground">{metricDescription}</p>
      </header>
      <ResponsiveContainer width="100%" height={200} debounce={50}>
        <ComposedChart
          data={chartData}
          margin={{
            top: 20,
          }}
          syncId={
            disableSync
              ? undefined
              : "allocator-scoring-metric-historical-chart"
          }
        >
          <XAxis dataKey="date" tickFormatter={formatDate} fontSize={14} />

          <YAxis
            type="number"
            fontSize={14}
            tickFormatter={mode === "datacap" ? toPiBs : undefined}
            label={{
              value: mode === "datacap" ? "Datacap (PiB)" : "Allocators Count",
              fontSize: 12,
              position: "insideLeft",
              angle: -90,
              style: {
                textAnchor: "middle",
              },
            }}
          />

          {params.map((param, index) => {
            if (chartType === "bar" || data.length === 1) {
              return (
                <Bar
                  key={`${param}_bar`}
                  dataKey={param}
                  name={paramsDict[param]}
                  stackId="barStack"
                  fill={colors[index]}
                  fillOpacity={0.5}
                  stroke="#000"
                  strokeWidth={1}
                  maxBarSize={24}
                  animationDuration={animationDuration}
                />
              );
            }

            return (
              <Area
                key={`${param}_area`}
                dataKey={param}
                name={paramsDict[param]}
                stackId="areaStack"
                fill={colors[index]}
                fillOpacity={0.5}
                stroke={colors[index]}
                animationDuration={animationDuration}
              />
            );
          })}

          <Tooltip
            content={ChartTooltip}
            labelFormatter={formatDate}
            formatter={mode === "datacap" ? toIEC : undefined}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </article>
  );
}
