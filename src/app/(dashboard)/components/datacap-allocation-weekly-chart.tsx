"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartTooltip } from "@/components/ui/chart";
import { IFilDCAllocationsWeekly } from "@/lib/interfaces/dmob/dmob.interface";
import { convertBytesToIEC, palette } from "@/lib/utils";
import { memo, useMemo } from "react";
import {
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  TooltipContentProps,
  XAxis,
  YAxis,
} from "recharts";
import {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";
import { useMediaQuery } from "usehooks-ts";

interface Props {
  data: IFilDCAllocationsWeekly;
}

const Component = ({ data }: Props) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const chartData = useMemo(() => {
    const normalData: {
      name: string;
      value: number;
    }[] = [];

    if (data) {
      Object.keys(data).forEach((yearKey) => {
        const yearObj = data[yearKey];
        Object.keys(yearObj).forEach((weekKey) => {
          if (+yearKey === 2024 && +weekKey < 17) return;
          normalData.push({
            name: `w${weekKey} '${yearKey.substring(2, 4)}`,
            value: +yearObj[weekKey],
          });
        });
      });
    }
    return normalData;
  }, [data]);

  return (
    <Card className="lg:col-span-2">
      <CardHeader className="flex-col items-start">
        <CardTitle>Accumulated DataCap Allocation to clients</CardTitle>
        <CardDescription>
          How much DataCap was used by allocators/given out to clients so far
        </CardDescription>
      </CardHeader>
      <CardContent className="flex w-full items-center justify-center">
        {!chartData && <p>Error loading data</p>}
        {chartData && (
          <ResponsiveContainer
            width="100%"
            aspect={isDesktop ? 1.77 : 16 / chartData.length}
            debounce={500}
          >
            <LineChart
              data={chartData}
              layout={isDesktop ? "horizontal" : "vertical"}
              margin={{ right: 50, left: 20, bottom: 50 }}
            >
              {isDesktop && (
                <XAxis
                  dataKey="name"
                  interval={0}
                  minTickGap={0}
                  tick={<CustomizedAxisTick />}
                />
              )}
              {isDesktop && (
                <YAxis
                  dataKey="value"
                  domain={["dataMin", "dataMax"]}
                  tickFormatter={(value) => convertBytesToIEC(value)}
                  tick={{
                    fontSize: 12,
                    fontWeight: 500,
                    fill: "var(--muted-foreground)",
                  }}
                />
              )}
              {!isDesktop && (
                <YAxis
                  dataKey="name"
                  type="category"
                  interval={0}
                  minTickGap={0}
                  tick={<CustomizedAxisTickMobile />}
                />
              )}
              {!isDesktop && (
                <XAxis
                  dataKey="value"
                  type="number"
                  domain={["dataMin", "dataMax"]}
                  tickFormatter={(value) => convertBytesToIEC(value)}
                  tick={{
                    fontSize: 12,
                    fontWeight: 500,
                    fill: "var(--muted-foreground)",
                  }}
                />
              )}
              <ChartTooltip
                content={(props: TooltipContentProps<ValueType, NameType>) => {
                  return (
                    <Card>
                      <CardHeader>
                        <CardTitle>{props.label}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {convertBytesToIEC(
                          props?.payload?.[0]?.value?.toString() ?? 0
                        )}
                      </CardContent>
                    </Card>
                  );
                }}
              />
              <Legend align="center" verticalAlign="top" />
              <Line
                isAnimationActive={false}
                layout={isDesktop ? "horizontal" : "vertical"}
                name="DataCap used per week"
                type="monotone"
                dataKey="value"
                stroke={palette(0)}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

const CustomizedAxisTick = (props: {
  x?: number;
  y?: number;
  stroke?: string;
  payload?: { value: string };
}) => {
  const {
    x,
    y,
    payload = {
      value: "",
    },
  } = props;
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dx={5}
        dy={10}
        fontSize={13}
        textAnchor="start"
        fill="#666"
        transform="rotate(65)"
      >
        {payload.value.substring(0, 25)}
        {payload.value.length > 25 ? "..." : ""}
      </text>
    </g>
  );
};

const CustomizedAxisTickMobile = (props: {
  x?: number;
  y?: number;
  stroke?: string;
  payload?: { value: string };
}) => {
  const {
    x,
    y,
    payload = {
      value: "",
    },
  } = props;
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dx={-5}
        dy={5}
        fontSize={13}
        textAnchor="end"
        fill="#666"
      >
        {payload.value.substring(0, 25)}
        {payload.value.length > 25 ? "..." : ""}
      </text>
    </g>
  );
};

const DatacapAllocationWeeklyChart = memo(Component);

export { DatacapAllocationWeeklyChart };
