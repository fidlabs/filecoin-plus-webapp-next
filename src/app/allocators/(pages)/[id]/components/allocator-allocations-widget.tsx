"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllocatorById } from "@/lib/api";
import { QueryKey } from "@/lib/constants";
import { IClient } from "@/lib/interfaces/dmob/client.interface";
import {
  calculateDateFromHeight,
  convertBytesToIEC,
  palette,
} from "@/lib/utils";
import { groupBy } from "lodash";
import { ComponentProps, useMemo } from "react";
import {
  Area,
  Bar,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  TooltipContentProps,
  XAxis,
  YAxis,
} from "recharts";
import {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";
import useSWR from "swr";

type CardProps = ComponentProps<typeof Card>;
export interface AllocatorAllocationsWidgetProps
  extends Omit<CardProps, "children"> {
  allocatorId: string;
}

export function AllocatorAllocationsWidget({
  allocatorId,
  ...rest
}: AllocatorAllocationsWidgetProps) {
  const { data } = useSWR(
    [QueryKey.ALLOCATOR_BY_ID, allocatorId],
    ([, allocatorId]) => {
      return getAllocatorById(allocatorId);
    },
    {
      keepPreviousData: true,
    }
  );

  const chartData = useMemo(() => {
    if (!data) return [];
    const groupedByHeight = groupBy(
      data.data.sort((a, b) => a.createdAtHeight - b.createdAtHeight),
      (val) => val.createdAtHeight
    );

    const newData = [] as {
      name: string;
      value: number;
      allocationValue: number;
      clients: IClient[];
    }[];

    Object.entries(groupedByHeight).forEach(([key, value], index) => {
      const totalDatacap = newData[index - 1]?.value || 0;
      const valueParsed = value.reduce(
        (acc, val) => acc + +val.initialAllowance,
        0
      );
      newData.push({
        name: key,
        value: totalDatacap + valueParsed,
        allocationValue: valueParsed,
        clients: value,
      });
    });

    return newData;
  }, [data]);

  return (
    <Card {...rest}>
      <div className="p-4">
        <header>
          <h3 className="text-xl font-medium">Allocation Over Time</h3>
        </header>
      </div>
      <div>
        <ResponsiveContainer width="100%" height={500} debounce={150}>
          <ComposedChart
            data={chartData}
            margin={{ top: 40, right: 50, left: 20, bottom: 20 }}
          >
            <XAxis
              dataKey="name"
              tick={{
                fontSize: 12,
                fontWeight: 500,
                fill: "var(--muted-foreground)",
              }}
              tickFormatter={(value) => calculateDateFromHeight(value)}
            />
            <YAxis
              dataKey="value"
              domain={[0, "dataMax"]}
              tickFormatter={(value) => convertBytesToIEC(value)}
              tick={{
                fontSize: 12,
                fontWeight: 500,
                fill: "var(--muted-foreground)",
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
            <Bar dataKey="allocationValue" fill={palette(0)} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

const renderTooltip = (props: TooltipContentProps<ValueType, NameType>) => {
  const payload = props?.payload?.[0]?.payload;
  if (!payload) {
    return <></>;
  }
  const { name, value, clients } = payload;

  return (
    <Card key={props?.payload?.length}>
      <CardHeader className="flex flex-col items-start gap-1">
        <CardTitle>{calculateDateFromHeight(name)}</CardTitle>
        <CardTitle>
          Total Allocations to Date: {convertBytesToIEC(value)}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-start gap-1">
        <CardTitle>New Clients:</CardTitle>
        {(clients as IClient[]).map((client) => (
          <div key={client.id} className="flex flex-col gap-1">
            <div>
              <span className="font-semibold text-dodger-blue">
                {client.name}
              </span>{" "}
              - {convertBytesToIEC(client.initialAllowance)}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
