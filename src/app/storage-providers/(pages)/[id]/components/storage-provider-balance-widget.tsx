"use client";

import {
  fetchStorageProviderFilscanInfo,
  type FetchStorageProviderFilscanInfoReturnType,
} from "@/app/storage-providers/storage-providers-data";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { QueryKey } from "@/lib/constants";
import { cn, filBalanceToDecimal, formatFilBalance } from "@/lib/utils";
import { type HTMLAttributes, useCallback, useMemo, useState } from "react";
import {
  Cell,
  Pie,
  PieChart,
  type PieProps,
  ResponsiveContainer,
  Sector,
  Tooltip,
} from "recharts";
import { type PieSectorDataItem } from "recharts/types/polar/Pie";
import useSWR from "swr";

type BaseProps = Omit<HTMLAttributes<HTMLDivElement>, "children">;
export interface StorageProviderBalanceWidgetProps extends BaseProps {
  storageProviderId: string;
}

type ChartData = Array<{
  name: string;
  value: number;
}>;

const colors = [
  "#66a61e",
  "hsl(var(--color-dodger-blue))",
  "orange",
  "#ff0029",
];

function filscanInfoToChartData(
  maybeFilscanInfo: FetchStorageProviderFilscanInfoReturnType | undefined
): ChartData {
  if (!maybeFilscanInfo) {
    return [];
  }

  return [
    {
      name: "Available",
      value: filBalanceToDecimal(maybeFilscanInfo.available_balance),
    },
    {
      name: "Initial Pledge",
      value: filBalanceToDecimal(maybeFilscanInfo.init_pledge),
    },
    {
      name: "Pre Commit Deposits",
      value: filBalanceToDecimal(maybeFilscanInfo.pre_deposits),
    },
    {
      name: "Locked Rewards",
      value: filBalanceToDecimal(maybeFilscanInfo.locked_balance),
    },
  ];
}

export function StorageProviderBalanceWidget({
  className,
  storageProviderId,
  ...rest
}: StorageProviderBalanceWidgetProps) {
  const [activeItemIndex, setActiveItemIndex] = useState(-1);
  const { data } = useSWR(
    [QueryKey.STORAGE_PROVIDER_FILSCAN_INFO, storageProviderId],
    ([, storageProviderId]) => {
      return fetchStorageProviderFilscanInfo({ storageProviderId });
    },
    { keepPreviousData: true }
  );

  const chartData = useMemo(() => {
    return filscanInfoToChartData(data);
  }, [data]);

  const handlePieMouseEnter = useCallback<
    NonNullable<PieProps["onMouseEnter"]>
  >((_data, index) => {
    setActiveItemIndex(() => index);
  }, []);

  const handlePieMouseLeave = useCallback<
    NonNullable<PieProps["onMouseLeave"]>
  >(() => {
    setActiveItemIndex(-1);
  }, []);

  return (
    <Card {...rest} className={cn("p-4", className)}>
      <header>
        {data ? (
          <p className="text-lg font-medium">
            {formatFilBalance(filBalanceToDecimal(data.balance))}
          </p>
        ) : (
          <Skeleton className="w-[100px] h-7" />
        )}
        <h3 className="text-xs text-muted-foreground">Total Balance</h3>
      </header>

      <ResponsiveContainer width="100%" height={300} debounce={50}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius="70%"
            innerRadius="55%"
            cursor="pointer"
            paddingAngle={1}
            activeShape={PieChartActiveShape}
            onMouseEnter={handlePieMouseEnter}
            onMouseLeave={handlePieMouseLeave}
          >
            {chartData.map((item, index) => (
              <Cell
                key={item.name}
                name={item.name}
                fill={colors[index]}
                cursor="pointer"
              />
            ))}

            <Tooltip
              defaultIndex={activeItemIndex}
              active={activeItemIndex !== -1}
              content={() => null}
            />
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      <ul className="flex flex-wrap gap-x-6 gap-y-2 justify-center">
        {chartData.map((item, index) => (
          <li key={`li_${item.name}`} className="mb-1 pl-4 relative">
            <span
              className={cn(
                "absolute h-2 w-2 rounded-full top-1/2 left-0 -mt-1 transition-all",
                index === activeItemIndex && "scale-150"
              )}
              style={{
                backgroundColor: colors[index],
              }}
            />
            <p className="text-sm font-medium">
              {formatFilBalance(item.value)}
            </p>
            <p className="text-xs text-muted-foreground">{item.name}</p>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function PieChartActiveShape({
  name,
  value,
  cx = 0,
  cy = 0,
  midAngle = 0,
  innerRadius,
  outerRadius = 0,
  startAngle,
  endAngle,
  fill,
}: PieSectorDataItem) {
  const RADIAN = Math.PI / 180;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? "start" : "end";

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path
        d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
        stroke={fill}
        fill="none"
      />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        textAnchor={textAnchor}
        fill="#333"
        fontSize={14}
      >
        {formatFilBalance(value)}
      </text>
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        dy={18}
        fontSize={12}
        textAnchor={textAnchor}
        fill="#999"
      >
        {name}
      </text>
    </g>
  );
}
