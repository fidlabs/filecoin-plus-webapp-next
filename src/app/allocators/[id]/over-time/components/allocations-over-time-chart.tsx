import {useAllocatorDetails} from "@/app/allocators/[id]/components/allocator.provider";
import {Line, LineChart, ResponsiveContainer, Tooltip, TooltipProps, XAxis, YAxis} from "recharts";
import {calculateDateFromHeight, convertBytesToIEC, palette} from "@/lib/utils";
import React from "react";
import {NameType, ValueType} from "recharts/types/component/DefaultTooltipContent";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {IClient} from "@/lib/interfaces/dmob.interface";

const AllocationsOverTimeChart = () => {
  const {chartData, loading} = useAllocatorDetails()

  if (!chartData || loading) {
    return <></>
  }

  return <ResponsiveContainer width="100%" aspect={2} debounce={500}>
    <LineChart
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
        domain={[0, 'dataMax']}
        tickFormatter={(value) => convertBytesToIEC(value)}
        tick={{
          fontSize: 12,
          fontWeight: 500,
          fill: 'var(--muted-foreground)'
        }}
      />
      <Tooltip content={renderTooltip} />
      <Line
        name="Allocations over time"
        type="monotone"
        dataKey="value"
        stroke={palette(0)}
      />
    </LineChart>
  </ResponsiveContainer>
}

const renderTooltip = (props: TooltipProps<ValueType, NameType>) => {
  console.log(props?.payload?.[0]?.payload)
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
          Total allocations to date: {convertBytesToIEC(value)}
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