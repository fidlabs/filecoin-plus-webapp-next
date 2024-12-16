"use client";
import {useDataCapAllocationsWeekly} from "@/lib/hooks/dmob.hooks";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Legend, Line, LineChart, ResponsiveContainer, TooltipProps, XAxis, YAxis} from "recharts";
import React, {memo, useMemo} from "react";
import {convertBytesToIEC, palette} from "@/lib/utils";
import {NameType, ValueType} from "recharts/types/component/DefaultTooltipContent";
import {ChartTooltip} from "@/components/ui/chart";

const Component = () => {
  const {
    data, loading
  } = useDataCapAllocationsWeekly();

  const chartData = useMemo(() => {
    const normalData: {
      name: string;
      value: number;
    }[] = [];

    if (data) {
      Object.keys(data).forEach((key) => {
        const yearObj = data[key];
        Object.keys(yearObj).forEach((weekKey) => {
          normalData.push({
            name: `w${weekKey} ${key}`,
            value: yearObj[weekKey]
          });
        });
      });
    }
    return normalData;
  }, [data]);

  return <Card className="lg:col-span-2">
    <CardHeader>
      <CardTitle>DataCap Allocation Week Over Week</CardTitle>
    </CardHeader>
    <CardContent className="flex w-full items-center justify-center">
      {
        !loading && !chartData && <p>Error loading data</p>
      }
      {chartData && <ResponsiveContainer width="100%" aspect={2} debounce={500}>
        <LineChart
          data={chartData}
          margin={{top: 40, right: 50, left: 20, bottom: 20}}
        >
          <XAxis
            dataKey="name"
            tick={{
              fontSize: 12,
              fontWeight: 500,
              fill: 'var(--muted-foreground)'
            }}
          />
          <YAxis
            dataKey="value"
            domain={['dataMin', 'dataMax']}
            tickFormatter={(value) => convertBytesToIEC(value)}
            tick={{
              fontSize: 12,
              fontWeight: 500,
              fill: 'var(--muted-foreground)'
            }}
          />
          <ChartTooltip content={(props: TooltipProps<ValueType, NameType>) => {
            return <Card>
              <CardHeader>
                <CardTitle>{props.label}</CardTitle>
              </CardHeader>
              <CardContent>{convertBytesToIEC(props?.payload?.[0]?.value?.toString() ?? 0)}</CardContent>
            </Card>
          }}/>
          <Legend/>
          <Line
            name="DataCap used per week"
            type="monotone"
            dataKey="value"
            stroke={palette(0)}
          />
        </LineChart>
      </ResponsiveContainer>}
    </CardContent>
  </Card>
}

const DatacapAllocationWeeklyChart = memo(Component);


export {DatacapAllocationWeeklyChart}