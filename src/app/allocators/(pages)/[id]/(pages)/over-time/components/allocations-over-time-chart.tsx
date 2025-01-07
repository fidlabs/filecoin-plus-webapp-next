"use client";
import {Area, Bar, ComposedChart, ResponsiveContainer, Tooltip, TooltipProps, XAxis, YAxis} from "recharts";
import {calculateDateFromHeight, convertBytesToIEC, palette} from "@/lib/utils";
import {NameType, ValueType} from "recharts/types/component/DefaultTooltipContent";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {IClient} from "@/lib/interfaces/dmob/client.interface";
import {useChartScale} from "@/lib/hooks/useChartScale";
import {IAllocatorResponse} from "@/lib/interfaces/dmob/allocator.interface";
import {useMemo} from "react";
import {groupBy} from "lodash";
import {GenericContentHeader} from "@/components/generic-content-view";
import {ScaleSelector} from "@/components/ui/scale-selector";
import {ITabNavigatorTab} from "@/components/ui/tab-navigator";

interface IAllocationsOverTimeChartProps {
  data: IAllocatorResponse
  allocatorId: string
}

const AllocationsOverTimeChart = ({data, allocatorId}: IAllocationsOverTimeChartProps) => {


  const chartData = useMemo(() => {
    if (!data) return [];
    const groupedByHeight = groupBy(data.data.sort((a, b) => a.createdAtHeight - b.createdAtHeight), val => val.createdAtHeight);

    const newData = [] as {
      name: string;
      value: number;
      allocationValue: number;
      clients: IClient[]
    }[];

    Object.entries(groupedByHeight).forEach(([key, value], index) => {
      const totalDatacap = newData[index - 1]?.value || 0;
      const valueParsed = value.reduce((acc, val) => acc + +val.initialAllowance, 0);
      newData.push({
        name: key,
        value: totalDatacap + valueParsed,
        allocationValue: valueParsed,
        clients: value
      });
    });

    return newData;
  }, [data]);

  const minValue = useMemo(() => {
    return chartData?.reduce((acc, current) => Math.min(acc, current.value), Infinity) ?? 0
  }, [chartData])

  const tabs = useMemo(() => {
    return [
      {
        label: <>
          <p>
            {data?.count}
          </p>
          <p>Verified Clients</p>
        </>,
        href: `/allocators/${allocatorId}`,
        value: 'list'
      },
      {
        label: 'Allocations over time',
        href: `/allocators/${allocatorId}/over-time`,
        value: 'chart'
      }
    ] as ITabNavigatorTab[]
  }, [allocatorId, data])

  const {scale, selectedScale, setSelectedScale} = useChartScale(minValue)

  return <Card>
    <GenericContentHeader placeholder="Client ID / Address / Name"
                          navigation={tabs}
                          selected={'chart'}
                          addons={<ScaleSelector scale={selectedScale} setScale={setSelectedScale}/>}
                          fixedHeight={false}/>
    <CardContent className="p-0">
      <ResponsiveContainer width="100%" aspect={2} debounce={500}>
        <ComposedChart
          data={chartData}
          margin={{ top: 40, right: 50, left: 20, bottom: 20 }}
        >
          <XAxis
            dataKey="name"
            tick={{
              fontSize: 12,
              fontWeight: 500,
              fill: 'var(--muted-foreground)'
            }}
            tickFormatter={(value) => calculateDateFromHeight(value)}
          />
          <YAxis
            dataKey="value"
            scale={scale}
            domain={[0, 'dataMax']}
            tickFormatter={(value) => convertBytesToIEC(value)}
            tick={{
              fontSize: 12,
              fontWeight: 500,
              fill: 'var(--muted-foreground)'
            }}
          />
          <Tooltip content={renderTooltip} />
          <Area
            name="Allocations over time"
            type="monotone"
            dataKey="value"
            stroke={palette(64)}
            fill={palette(64)}
          />
          <Bar dataKey="allocationValue" barSize={50} fill={palette(0)} />
        </ComposedChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
}

const renderTooltip = (props: TooltipProps<ValueType, NameType>) => {
  const payload = props?.payload?.[0]?.payload
  if (!payload) {
    return <></>
  }
  const {name, value, clients} = payload;

  return (<Card key={props?.payload?.length}>
      <CardHeader className="flex flex-col items-start gap-1">
        <CardTitle>
          {calculateDateFromHeight(name)}
        </CardTitle>
        <CardTitle>
          Total Allocations to Date: {convertBytesToIEC(value)}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-start gap-1">
        <CardTitle>
          New Clients:
        </CardTitle>
        {
          (clients as IClient[]).map((client) => (
            <div key={client.id} className="flex flex-col gap-1">
              <div>
                <span className="font-semibold text-dodger-blue">{client.name}</span> - {convertBytesToIEC(client.initialAllowance)}
              </div>
            </div>
          ))
        }
      </CardContent>
    </Card>);
};

export {AllocationsOverTimeChart}