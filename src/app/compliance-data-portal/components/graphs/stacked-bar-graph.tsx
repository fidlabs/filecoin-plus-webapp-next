"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartLoader } from "@/components/ui/chart-loader";
import { Scale } from "@/lib/hooks/useChartScale";
import { convertBytesToIEC, palette } from "@/lib/utils";
import { uniq } from "lodash";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Label,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from "recharts";
import {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";
import { useMediaQuery } from "usehooks-ts";

type DataItem = Record<string, string | number>;

interface Props<T extends DataItem = DataItem> {
  data: T[];
  scale?: Scale;
  isLoading: boolean;
  unit?: string;
  customPalette?: string[];
  usePercentage?: boolean;
  currentDataTab: string;
  onBarClick?(dataItem: T): void;
}

export function StackedBarGraph({
  data,
  scale = "linear",
  isLoading,
  customPalette,
  usePercentage,
  unit = "",
  currentDataTab,
  onBarClick,
}: Props) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const renderTooltip = (props: TooltipProps<ValueType, NameType>) => {
    const payload = props?.payload?.[0]?.payload;
    if (!payload) {
      return null;
    }
    return (
      <Card>
        <CardHeader>
          <CardTitle>{payload.name}</CardTitle>
        </CardHeader>
        <CardContent>
          {dataKeys.map((key: string, index: number) => {
            const value = payload[`group${index}`] ?? payload[key];
            const color = customPalette
              ? customPalette[index % customPalette.length]
              : palette(index);
            if (typeof value === "undefined") {
              return null;
            }
            const name =
              payload[`group${index}Name`] ?? payload[`${key}Name`] ?? key;
            const isRegularValue = usePercentage || currentDataTab === "Count";
            const valueText = isRegularValue ? value : convertBytesToIEC(value);
            return (
              <div key={key} className="chartTooltipRow">
                {!usePercentage && (
                  <div style={{ color }}>
                    {name} - {valueText}
                    {isRegularValue && (
                      <>
                        {" "}
                        {unit}
                        {value !== 1 && "s"}
                      </>
                    )}
                  </div>
                )}
                {usePercentage && (
                  <div style={{ color }}>
                    {name} - {value.toFixed(2)}% of {unit}s
                  </div>
                )}
              </div>
            );
          })}
          {payload["avgSuccessRate"] && (
            <div className="mt-2 text-sm text-[#252525]">
              Average Success Rate - {payload["avgSuccessRate"].toFixed(2)}%
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const parseDataMax = (dataMax: number) => {
    if (dataMax < 150) {
      return Math.ceil(dataMax / 20) * 20;
    }
    if (dataMax > 300) {
      return Math.ceil(dataMax / 100) * 100;
    }
    return Math.ceil(dataMax / 50) * 50;
  };

  const dataKeys = useMemo(() => {
    return uniq(
      data
        .flatMap((data) => Object.keys(data))
        .filter(
          (key) =>
            !key.toLowerCase().includes("name") &&
            !key.includes("avgSuccessRate")
        )
    );
  }, [data]);

  const haveAverageSuccessRate = useMemo(() => {
    return data.some((data) => Object.keys(data).includes("avgSuccessRate"));
  }, [data]);

  if (isLoading) {
    return (
      <div
        className="flex w-full justify-center items-center"
        style={{
          aspectRatio: isDesktop ? "1.8" : "0.5",
        }}
      >
        <ChartLoader />
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="flex w-full min-h-[350px] justify-center items-center">
        Data not available
      </div>
    );
  }

  return (
    <div>
      <ResponsiveContainer
        width="100%"
        aspect={isDesktop ? 1.8 : 0.5}
        debounce={500}
      >
        <BarChart
          layout={!isDesktop ? "vertical" : "horizontal"}
          data={data}
          margin={{
            bottom: isDesktop ? (data.length > 6 ? 75 : 30) : 1,
            right: isDesktop ? 30 : 1,
            left: 20,
            top: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip content={renderTooltip} />
          <Tooltip />
          {dataKeys.map((key, index) => (
            <Bar
              layout={!isDesktop ? "vertical" : "horizontal"}
              key={key}
              dataKey={key}
              style={{
                stroke: "#212121",
                strokeWidth: 1,
                cursor: onBarClick ? "pointer" : "default",
              }}
              barSize={haveAverageSuccessRate ? 20 : undefined}
              stackId="a"
              fill={
                customPalette
                  ? customPalette[index % customPalette.length]
                  : palette(index)
              }
              onClick={onBarClick}
            />
          ))}

          {isDesktop && usePercentage && haveAverageSuccessRate && (
            <Bar
              layout={!isDesktop ? "vertical" : "horizontal"}
              dataKey="avgSuccessRate"
              style={{ stroke: "#212121", strokeWidth: 1 }}
              fill="#252525"
              barSize={5}
            />
          )}
          {isDesktop && (
            <XAxis
              dataKey="name"
              angle={data.length > 6 ? 90 : 0}
              interval={0}
              minTickGap={0}
              tick={data.length > 6 ? <CustomizedAxisTick /> : true}
            />
          )}
          {isDesktop && (
            <YAxis
              domain={[0, usePercentage ? 100 : parseDataMax]}
              scale={usePercentage ? "linear" : scale}
              tickFormatter={(value) =>
                usePercentage
                  ? `${value}%`
                  : currentDataTab === "Count"
                    ? value
                    : convertBytesToIEC(value)
              }
            >
              <Label
                value={`${usePercentage ? "%" : "#"} ${
                  String(unit).charAt(0).toUpperCase() + String(unit).slice(1)
                }s`}
                position="left"
                offset={10}
                angle={270}
                fill="#666"
              />
            </YAxis>
          )}
          {!isDesktop && (
            <YAxis
              dataKey="name"
              type="category"
              interval={0}
              minTickGap={0}
              stroke="#fff"
              mirror
              tick={<CustomizedAxisTick />}
            />
          )}
          {!isDesktop && (
            <XAxis
              type="number"
              scale={usePercentage ? "linear" : scale}
              tickFormatter={(value) =>
                usePercentage
                  ? `${value}%`
                  : currentDataTab === "Count"
                    ? value
                    : convertBytesToIEC(value)
              }
              name="PiB"
              domain={[0, usePercentage ? 100 : parseDataMax]}
            >
              <Label
                value={`${usePercentage ? "%" : "#"} ${
                  String(unit).charAt(0).toUpperCase() + String(unit).slice(1)
                }s`}
                position="bottom"
                offset={-10}
                fill="#666"
              />
            </XAxis>
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

const CustomizedAxisTick = (props: {
  x?: number;
  y?: number;
  stroke?: string;
  payload?: { value: string };
}) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const { x, y, payload } = props;
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dx={isDesktop ? 5 : 0}
        dy={isDesktop ? 10 : 5}
        textAnchor="start"
        fill={isDesktop ? "#666" : "#fff"}
        fontSize={14}
        transform={isDesktop ? "rotate(65)" : "rotate(0)"}
      >
        {payload?.value.toString().substring(0, 25)}
        {(payload?.value?.length ?? 0) > 25 ? "..." : ""}
      </text>
    </g>
  );
};
