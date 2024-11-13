import {Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, TooltipProps, XAxis, YAxis} from 'recharts';
import {palette} from "@/lib/utils";
import {useMemo} from "react";
import {uniq} from "lodash";
import {NameType, ValueType} from "recharts/types/component/DefaultTooltipContent";
import {Scale} from "@/lib/hooks/useChartScale";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";

interface Props {
  data: { [key: PropertyKey]: string | number }[],
  scale?: Scale,
  isLoading: boolean,
  color?: string,
  unit?: string
}

const StackedBarGraph = ({ data, scale = 'linear', isLoading, color, unit = 'allocators' }: Props) => {

  console.log(data, scale, isLoading, color, unit)

  const renderTooltip = (props: TooltipProps<ValueType, NameType>) => {
    const payload = props?.payload?.[0]?.payload;
    if (!payload) {
      return null;
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {payload.name}
          </CardTitle>
        </CardHeader>
        <CardContent>{
          dataKeys.map((key: string, index: number) => {
            const value = payload[`group${index}`] ?? payload[key];
            if (!value) {
              return null;
            }
            const name = payload[`group${index}Name`] ?? payload[`${key}Name`] ?? key;
            return <div key={key} className="chartTooltipRow">
              <div style={{ color: palette(index) }} >{name} - {value} {unit}</div>
            </div>
          })
        }</CardContent>
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
    return uniq(data.flatMap(data => Object.keys(data)).filter(key => !key.toLowerCase().includes('name')));
  }, [data]);

  if (isLoading) {
    return <div>
      <div>
        Loading
      </div>
    </div>
  }

  if (!data?.length) {
    return null;
  }

  return <div>
    <ResponsiveContainer width="100%" aspect={3 / 2} debounce={500}>
      <BarChart
        data={data}
        margin={{ bottom: data.length > 6 ? 150 : 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip content={renderTooltip} />
        <XAxis dataKey="name" angle={data.length > 6 ? 90 : 0} interval={0} minTickGap={0}
               tick={data.length > 6 ? <CustomizedAxisTick /> : true} />
        <YAxis domain={[0, parseDataMax]} />
        <Tooltip />
        {dataKeys.map((key, index) => <Bar key={key} dataKey={key}
                                          stackId="a" fill={color ?? palette(index)} />)}
        ))
      </BarChart>
    </ResponsiveContainer>
  </div>
}

const CustomizedAxisTick = (props: {
  x?: number,
  y?: number,
  stroke?: string,
  payload?: { value: string }
}) => {
  const { x, y, payload } = props;
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dx={-5} dy={5} textAnchor="end" fill="#666" fontSize={15} transform="rotate(-90)">
        {payload?.value.substring(0, 25)}{(payload?.value?.length ?? 0) > 25 ? '...' : ''}
      </text>
    </g>
  );
};

export {StackedBarGraph};
