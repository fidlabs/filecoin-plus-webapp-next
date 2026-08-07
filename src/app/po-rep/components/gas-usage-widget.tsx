"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { QueryKey } from "@/lib/constants";
import { createFetcherHook } from "@/lib/data-loading";
import { fetchGasUsage } from "@/lib/po-rep-oracle";
import { cn, divideBigint, formatFIL, palette } from "@/lib/utils";
import { type ComponentProps, useCallback, useMemo, useState } from "react";
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

interface ChartEntry {
  label: string;
  value: number;
  percentage: number;
  count: number;
  [key: string]: unknown;
}

type CardProps = ComponentProps<typeof Card>;
export type GasUsageWidgetProps = Omit<CardProps, "children">;

const useGasUsage = createFetcherHook(fetchGasUsage, QueryKey.PO_REP_GAS_USAGE);
const percentageFormatter = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 2,
});

export function GasUsageWidget({ className, ...rest }: GasUsageWidgetProps) {
  const [activeIndex, setActiveIndex] = useState(-1);
  const { data } = useGasUsage({});

  const chartData = useMemo(() => {
    if (!data) {
      return [];
    }

    const totalGasUsage = BigInt(data.data.totalGasUsage);

    return data.data.gasUsageByFunction
      .map<ChartEntry>((item) => {
        return {
          label: item.functionName,
          value: Number(item.gasUsed),
          percentage: divideBigint(BigInt(item.gasUsed), totalGasUsage),
          count: parseInt(item.transactionCount, 10),
        };
      })
      .sort((a, b) => {
        return b.percentage - a.percentage;
      });
  }, [data]);

  const handlePieEnter = useCallback<NonNullable<PieProps["onMouseEnter"]>>(
    (_data, index) => {
      setActiveIndex(() => index);
    },
    []
  );

  const handlePieLeave = useCallback(() => {
    setActiveIndex(-1);
  }, []);

  return (
    <Card {...rest} className={cn("pt-4", className)}>
      <header className="px-4 pb-6 border-b">
        <h3 className="text-lg font-medium">Gas Usage</h3>
        <p className="text-xs text-muted-foreground">
          Oracle gas usage breakdown by PoRep contract method.
        </p>
      </header>

      <div className="grid lg:grid-cols-2">
        <ResponsiveContainer width="100%" aspect={1} debounce={50}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius="60%"
              innerRadius="50%"
              dataKey="value"
              activeShape={PieChartActiveShape}
              onMouseEnter={handlePieEnter}
              onMouseLeave={handlePieLeave}
              cursor="pointer"
              paddingAngle={1}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  name={entry.label}
                  fill={palette(index)}
                  cursor="pointer"
                />
              ))}
            </Pie>

            <foreignObject
              x="calc(50% - 75px)"
              y="calc(50% - 75px)"
              width="150"
              height="150"
            >
              <div className="flex flex-col items-center justify-center w-[150px] h-[150px]">
                {data ? (
                  <p className="text-xl">
                    {formatFIL(data.data.totalGasUsage)}
                  </p>
                ) : (
                  <Skeleton className="w-[90px] h-9" />
                )}
                <p className="text-xs text-muted-foreground">Total Gas Usage</p>
              </div>
            </foreignObject>

            <Tooltip
              defaultIndex={activeIndex}
              active={activeIndex !== -1}
              content={() => null}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="lg:border-l">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Function Name</TableHead>
                <TableHead className="text-right">Count</TableHead>
                <TableHead className="text-right">Usage %</TableHead>
                <TableHead className="text-right">Gas Used</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {chartData.map(({ count, label, percentage, value }, index) => {
                return (
                  <TableRow
                    key={index}
                    onMouseEnter={() => setActiveIndex(() => index)}
                    onMouseLeave={() => setActiveIndex(() => -1)}
                    style={{
                      backgroundColor:
                        activeIndex === index
                          ? `${palette(index)}33`
                          : undefined,
                    }}
                  >
                    <TableCell>{label}</TableCell>
                    <TableCell align="right">{count}</TableCell>
                    <TableCell align="right">
                      {percentageFormatter.format(percentage)}
                    </TableCell>
                    <TableCell align="right">{formatFIL(value)}</TableCell>
                  </TableRow>
                );
              })}

              {!!data && (
                <TableRow className="font-semibold">
                  <TableCell align="right" colSpan={3}>
                    Total:
                  </TableCell>
                  <TableCell align="right">
                    {formatFIL(data.data.totalGasUsage)}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
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
        {formatFIL(value)}
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
