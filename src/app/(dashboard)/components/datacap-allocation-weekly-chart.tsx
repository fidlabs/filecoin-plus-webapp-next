"use client";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Legend, Line, LineChart, ResponsiveContainer, TooltipProps, XAxis, YAxis} from "recharts";
import {memo, useMemo} from "react";
import {convertBytesToIEC, palette} from "@/lib/utils";
import {NameType, ValueType} from "recharts/types/component/DefaultTooltipContent";
import {ChartTooltip} from "@/components/ui/chart";
import {IFilDCAllocationsWeekly} from "@/lib/interfaces/dmob/dmob.interface";

interface Props {
  data: IFilDCAllocationsWeekly
}

const Component = ({data}: Props) => {

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
            name: `w${weekKey} '${yearKey.substr(2)}`,
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
        !chartData && <p>Error loading data</p>
      }
      {chartData && <ResponsiveContainer width="100%" aspect={1.77} debounce={500}>
        <LineChart
          data={chartData}
          margin={{top: 20, right: 50, left: 20, bottom: 50}}
        >
          <XAxis
            dataKey="name"
            interval={0}
            minTickGap={0}
            tick={<CustomizedAxisTick/>}
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
          <Legend align="center" verticalAlign="top"/>
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

const CustomizedAxisTick = (props: {
  x?: number,
  y?: number,
  stroke?: string,
  payload?: { value: string }
}) => {
  const {
    x, y, payload = {
      value: ''
    }
  } = props;
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dx={5} dy={10} fontSize={13} textAnchor="start" fill="#666" transform="rotate(65)">
        {payload.value.substring(0, 25)}{payload.value.length > 25 ? '...' : ''}
      </text>
    </g>
  );
};

const DatacapAllocationWeeklyChart = memo(Component);


export {DatacapAllocationWeeklyChart}