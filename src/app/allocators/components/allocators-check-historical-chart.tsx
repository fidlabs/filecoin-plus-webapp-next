import { ChartTooltip } from "@/components/chart-tooltip";
import { weekFromDate, weekToReadableString } from "@/lib/weeks";
import { UTCDate } from "@date-fns/utc";
import { startOfMonth, startOfWeek, sub } from "date-fns";
import { filesize } from "filesize";
import { HTMLAttributes, useCallback, useMemo } from "react";
import {
  Area,
  Bar,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { FetchAllocatorsChecksBreakdownReturnType } from "../allocators-data";
import { cn } from "@/lib/utils";

type Interval = "month" | "week";
type DataItem =
  FetchAllocatorsChecksBreakdownReturnType[number]["data"][number];
type ChartEntry = Pick<DataItem, "date"> & Partial<Omit<DataItem, "date">>;

export interface AllocatorsChecksHistoricalChartProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  animationDuration?: number;
  checkDescription: string;
  checkName: string;
  data: ChartEntry[];
  disableSync?: boolean;
  interval: Interval;
  minIntervalsCount?: number;
  mode?: "checkCount" | "datacap";
  chartType?: "area" | "bar";
}

const onePiB = 1024n ** 5n;
const datacapPrecisionDivider = 10000;
const successColor = "#66a61e";
const errorColor = "#ff0029";

export function AllocatorsChecksHistoricalChart({
  animationDuration,
  chartType = "bar",
  checkDescription,
  checkName,
  className,
  data,
  disableSync = false,
  interval,
  minIntervalsCount = 0,
  mode = "datacap",
  style,
  ...rest
}: AllocatorsChecksHistoricalChartProps) {
  const showBars =
    (mode === "datacap" && chartType === "bar") ||
    (mode === "checkCount" && data.length === 1);
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

      const sanitiziedValue = value.endsWith("Z") ? value : value + "Z";

      if (interval === "week") {
        return weekToReadableString(weekFromDate(sanitiziedValue));
      }

      return new UTCDate(sanitiziedValue).toLocaleString("en-US", {
        month: "short",
        year: "numeric",
      });
    },
    [interval]
  );

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
        <h5 className="text-sm font-semibold">{checkName}</h5>
        <p className="text-xs text-muted-foreground">{checkDescription}</p>
      </header>
      <ResponsiveContainer width="100%" height={200} debounce={50}>
        <ComposedChart
          data={chartData}
          margin={{
            top: 20,
          }}
          syncId={disableSync ? undefined : "allocator-check-historical-chart"}
        >
          <XAxis dataKey="date" tickFormatter={formatDate} fontSize={12} />

          {mode === "datacap" && (
            <YAxis
              yAxisId="datacapYAxis"
              type="number"
              fontSize={14}
              tickFormatter={toPiBs}
              label={{
                value: "Datacap (PiB)",
                fontSize: 12,
                position: "insideLeft",
                angle: -90,
                style: {
                  textAnchor: "middle",
                },
              }}
            />
          )}

          {mode === "checkCount" && (
            <YAxis
              yAxisId="allocatorsCountYAxis"
              type="number"
              fontSize={14}
              label={{
                value: "Allocators Count",
                fontSize: 12,
                position: "insideLeft",
                angle: -90,
                style: {
                  textAnchor: "middle",
                },
              }}
            />
          )}

          {data.length !== 1 && (
            <>
              {chartType === "area" && (
                <>
                  <Area
                    dataKey="checkFailedAllocatorsDatacap"
                    name="Non-Compliant Datacap"
                    yAxisId="datacapYAxis"
                    stackId="area"
                    hide={mode === "checkCount"}
                    fill={errorColor}
                    fillOpacity={0.5}
                    stroke={errorColor}
                    animationDuration={animationDuration}
                  />
                  <Area
                    dataKey="checkPassedAllocatorsDatacap"
                    name="Compliant Datacap"
                    yAxisId="datacapYAxis"
                    stackId="area"
                    hide={mode === "checkCount"}
                    fill={successColor}
                    fillOpacity={0.5}
                    stroke={successColor}
                    animationDuration={animationDuration}
                  />
                </>
              )}
              <Line
                dataKey="checkFailedAllocatorsCount"
                yAxisId="allocatorsCountYAxis"
                type="monotone"
                stroke={errorColor}
                name="Non-compliant Allocators"
                hide={mode === "datacap"}
                animationDuration={animationDuration}
              />
              <Line
                dataKey="checkPassedAllocatorsCount"
                yAxisId="allocatorsCountYAxis"
                type="monotone"
                stroke={successColor}
                name="Compliant Allocators"
                hide={mode === "datacap"}
                animationDuration={animationDuration}
              />
            </>
          )}

          {showBars && (
            <>
              <Bar
                dataKey={
                  mode === "datacap"
                    ? "checkFailedAllocatorsDatacap"
                    : "checkFailedAllocatorsCount"
                }
                name={
                  mode === "datacap"
                    ? "Non-Compliant Datacap"
                    : "Non-Compliant Allocators"
                }
                yAxisId={
                  mode === "datacap" ? "datacapYAxis" : "allocatorsCountYAxis"
                }
                stackId="barStack"
                fill={errorColor}
                fillOpacity={0.5}
                stroke="#000"
                strokeWidth={1}
                maxBarSize={24}
                animationDuration={animationDuration}
              />

              <Bar
                dataKey={
                  mode === "datacap"
                    ? "checkPassedAllocatorsDatacap"
                    : "checkPassedAllocatorsCount"
                }
                name={
                  mode === "datacap"
                    ? "Compliant Datacap"
                    : "Compliant Allocators"
                }
                yAxisId={
                  mode === "datacap" ? "datacapYAxis" : "allocatorsCountYAxis"
                }
                stackId="barStack"
                fill={successColor}
                fillOpacity={0.6}
                stroke="#000"
                strokeWidth={1}
                maxBarSize={24}
                animationDuration={animationDuration}
              />
            </>
          )}

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
