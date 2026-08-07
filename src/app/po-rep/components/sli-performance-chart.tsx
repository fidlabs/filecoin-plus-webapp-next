"use client";

import { ChartStat } from "@/components/chart-stat";
import {
  ChartTooltipContainer,
  ChartTooltipGrid,
  ChartTooltipHeader,
  ChartTooltipTitle,
} from "@/components/chart-tooltip";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrayElement, isSameMonth, isValidDate } from "@/lib/utils";
import { useCallback, useMemo, useState, type ComponentProps } from "react";
import {
  Bar,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  TooltipContentProps,
  XAxis,
  YAxis,
} from "recharts";

type CardProps = ComponentProps<typeof Card>;
export interface SLIPerformanceChartProps extends Omit<CardProps, "children"> {
  averageLabel?: string;
  averageUnit: string;
  data: ChartEntry[];
  heading: string;
  description?: string;
}

interface ChartEntry {
  date: string;
  passing: number;
  failing: number;
  average: number;
}

const scales = ["linear", "percentage"] as const;
const scalesLabelDict: Record<ArrayElement<typeof scales>, string> = {
  linear: "Linear",
  percentage: "Percentage",
};

const dateMonthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const percentageFormatter = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 2,
});

const numericFormatter = new Intl.NumberFormat("en-US");

export function SLIPerformanceChart({
  averageLabel = "Average",
  averageUnit,
  data,
  heading,
  description,
  ...rest
}: SLIPerformanceChartProps) {
  const [scale, setScale] = useState<string>(scales[0]);

  const chartData = useMemo(() => {
    if (scale !== "percentage") {
      return data;
    }

    return data.map((entry) => {
      const total = entry.passing + entry.failing;
      const passingPercentage = total === 0 ? 1 : entry.passing / total;
      const failingPercentage = 1 - passingPercentage;

      return {
        ...entry,
        passing: passingPercentage,
        failing: failingPercentage,
      };
    });
  }, [data, scale]);

  const formatXAxisTick = useCallback(
    (value: unknown, index: number) => {
      if (typeof value !== "string" && typeof value !== "number") {
        return String(value);
      }

      const date = new Date(value);
      const previousEntry = chartData[index - 1];
      return !!previousEntry && isSameMonth(date, previousEntry.date)
        ? date.getDate().toString()
        : `${date.getDate()} ${dateMonthFormatter.format(date)}`;
    },
    [chartData]
  );

  const formatDate = useCallback((value: unknown) => {
    if (typeof value !== "string") {
      return String(value);
    }

    const date = new Date(value);
    return isValidDate(date) ? dateFormatter.format(date) : String(date);
  }, []);

  const formatValue = useCallback(
    (value: string | number) => {
      if (typeof value === "number" && scale === "percentage") {
        return percentageFormatter.format(value);
      }

      return String(value);
    },
    [scale]
  );

  const formatAverage = useCallback(
    (value: number) => {
      return averageUnit === "%"
        ? percentageFormatter.format(value)
        : numericFormatter.format(value) + ` ${averageUnit}`;
    },
    [averageUnit]
  );

  const formatTooltipValue = useCallback(
    (value: string | number, name: string) => {
      if (typeof value === "number" && name === averageLabel) {
        return formatAverage(value);
      }

      return formatValue(value);
    },
    [averageLabel, formatAverage, formatValue]
  );

  const [passingProviders, passingProvidersChange] = useMemo<
    [string, number | undefined]
  >(() => {
    const currentEntry = chartData.at(-1);

    if (!currentEntry) {
      return ["N/A", undefined];
    }

    const previousEntry = chartData.at(-2);

    if (!previousEntry) {
      return [formatValue(currentEntry.passing), undefined];
    }

    const change =
      previousEntry.passing === 0
        ? undefined
        : currentEntry.passing / previousEntry.passing - 1;

    return [formatValue(currentEntry.passing), change];
  }, [chartData, formatValue]);

  return (
    <Card {...rest}>
      <header className="px-4 pt-6 mb-2 flex flex-wrap items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">{heading}</h3>
          {!!description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>

        <Tabs value={scale} onValueChange={setScale}>
          <TabsList>
            {scales.map((possibleScale) => (
              <TabsTrigger key={possibleScale} value={possibleScale}>
                {scalesLabelDict[possibleScale]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </header>

      <div className="px-4 mb-6">
        <ChartStat
          label="Passing Providers"
          value={passingProviders}
          percentageChange={passingProvidersChange}
        />
      </div>

      <div>
        <ResponsiveContainer width="100%" height={400} debounce={50}>
          <ComposedChart
            data={chartData}
            barGap={0}
            barCategoryGap={0}
            margin={{
              top: 16,
              left: 24,
              right: 16,
            }}
          >
            <XAxis
              dataKey="date"
              fontSize={12}
              tickFormatter={formatXAxisTick}
            />
            <YAxis
              yAxisId="providers"
              fontSize={12}
              domain={scale === "percentage" ? [0, 1] : undefined}
              tickFormatter={
                scale === "percentage" ? percentageFormatter.format : undefined
              }
              label={{
                value: scale === "percentage" ? "Providers (%)" : "Providers",
                position: "insideLeft",
                angle: -90,
                fontSize: 12,
                style: {
                  textAnchor: "middle",
                },
              }}
            />
            <YAxis
              yAxisId="average"
              orientation="right"
              fontSize={12}
              domain={averageUnit === "%" ? [0, 1] : undefined}
              label={{
                value: averageLabel,
                position: "insideRight",
                angle: 90,
                fontSize: 12,
                offset: 12,
                style: {
                  textAnchor: "middle",
                },
              }}
              tickFormatter={formatAverage}
            />
            <Tooltip
              content={CustomTooltipContent}
              labelFormatter={formatDate}
              formatter={formatTooltipValue}
            />
            <Bar
              dataKey="passing"
              yAxisId="providers"
              stackId="providers"
              name="Passing Providers"
              fill="green"
            />
            <Bar
              dataKey="failing"
              yAxisId="providers"
              stackId="providers"
              name="Failing Providers"
              fill="var(--chart-1)"
            />
            <Line
              yAxisId="average"
              dataKey="average"
              name={averageLabel}
              stroke="rgba(0, 0, 0, 0.4)"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function CustomTooltipContent(
  props: TooltipContentProps<number | string, string>
) {
  if (!props.payload || props.payload.length === 0) {
    return null;
  }

  const labelText = props.labelFormatter
    ? props.labelFormatter(props.label, props.payload ?? [])
    : props.label;

  const averagePayloadIndex = props.payload.findIndex(
    (payload) => payload.dataKey === "average"
  );
  const averagePayload =
    averagePayloadIndex === -1 ? null : props.payload[averagePayloadIndex];

  const groupsPayloads =
    averagePayloadIndex === -1
      ? props.payload
      : props.payload.toSpliced(averagePayloadIndex, 1);

  return (
    <ChartTooltipContainer>
      <ChartTooltipHeader>
        <ChartTooltipTitle>{labelText}</ChartTooltipTitle>

        {!!averagePayload && typeof averagePayload.value === "number" && (
          <p className="text-sm">
            {averagePayload.name}:{" "}
            <strong className="font-semibold">
              {props.formatter
                ? props.formatter(
                    averagePayload.value,
                    averagePayload.name ?? "",
                    averagePayload,
                    averagePayloadIndex,
                    props.payload ?? []
                  )
                : averagePayload.value}
            </strong>
          </p>
        )}
      </ChartTooltipHeader>

      <ChartTooltipGrid payload={groupsPayloads} formatter={props.formatter} />
    </ChartTooltipContainer>
  );
}
