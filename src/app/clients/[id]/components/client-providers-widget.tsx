"use client";

import { ChartTooltip } from "@/components/chart-tooltip";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QueryKey } from "@/lib/constants";
import { palette } from "@/lib/utils";
import { filesize } from "filesize";
import Link from "next/link";
import { useCallback, useState, type ComponentProps } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Sector,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PieSectorDataItem } from "recharts/types/polar/Pie";
import useSWR from "swr";
import {
  fetchClientProviders,
  FetchClientProvidersReturnType,
} from "../../clients-data";

type Provider = FetchClientProvidersReturnType["stats"][number];
type PieProps = ComponentProps<typeof Pie>;
type CardProps = ComponentProps<typeof Card>;

export interface ClientProvidersWidgetProps
  extends Omit<CardProps, "children"> {
  clientId: string;
}

const percentageFormatter = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 2,
});

const formatDatacap = (value: string | number) =>
  filesize(value, { standard: "iec" });

export function ClientProvidersWidget({
  clientId,
  ...rest
}: ClientProvidersWidgetProps) {
  const [activeProviderIndex, setActiveProviderIndex] = useState(-1);
  const [chartType, setChartType] = useState("pie");
  const { data } = useSWR(
    [QueryKey.CLIENT_PROVIDERS, { clientId }],
    ([, fetchParameters]) => fetchClientProviders(fetchParameters),
    {
      keepPreviousData: true,
    }
  );

  const providers = data?.stats ?? [];

  const handlePieEnter = useCallback<NonNullable<PieProps["onMouseEnter"]>>(
    (_data, index) => {
      setActiveProviderIndex(() => index);
    },
    []
  );

  const getPercentValue = useCallback((provider: Provider) => {
    return parseFloat(provider.percent);
  }, []);

  return (
    <Card {...rest}>
      <header className="p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-medium">Providers</h3>
          <p className="text-xs text-muted-foreground">
            Browser Client Providers breakdown by Datacap used
          </p>
        </div>

        <Tabs value={chartType} onValueChange={setChartType}>
          <TabsList>
            <TabsTrigger value="pie">Pie Chart</TabsTrigger>
            <TabsTrigger value="bar">Bar Chart</TabsTrigger>
          </TabsList>
        </Tabs>
      </header>

      {!!data && (
        <ResizablePanelGroup className="border-t" direction="horizontal">
          <ResizablePanel defaultSize={65}>
            <ResponsiveContainer width="100%" aspect={1} debounce={50}>
              {chartType === "pie" ? (
                <PieChart>
                  <Pie
                    data={providers}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius="70%"
                    innerRadius="55%"
                    dataKey={getPercentValue}
                    activeShape={ActiveShape}
                    onMouseEnter={handlePieEnter}
                    cursor="pointer"
                    paddingAngle={1}
                  >
                    {providers.map((provider, index) => (
                      <Cell
                        key={`cell-${index}`}
                        name={provider.provider}
                        fill={palette(index)}
                        cursor="pointer"
                      />
                    ))}
                  </Pie>

                  <Tooltip
                    defaultIndex={activeProviderIndex}
                    active={activeProviderIndex !== -1}
                    content={() => null}
                  />
                </PieChart>
              ) : (
                <BarChart
                  data={providers}
                  margin={{ top: 40, bottom: 50, left: 16, right: 16 }}
                >
                  <XAxis
                    dataKey="provider"
                    interval={0}
                    fontSize={14}
                    angle={90}
                    textAnchor="start"
                    tickMargin={4}
                  />
                  <YAxis
                    width="auto"
                    tickFormatter={formatDatacap}
                    fontSize={14}
                  />

                  <Tooltip
                    defaultIndex={activeProviderIndex}
                    active={activeProviderIndex !== -1}
                    content={ChartTooltip}
                    formatter={formatDatacap}
                  />

                  <Bar
                    dataKey="total_deal_size"
                    name="Total Deal Size"
                    onMouseLeave={() => setActiveProviderIndex(() => -1)}
                    onMouseEnter={(_, index) =>
                      setActiveProviderIndex(() => index)
                    }
                    cursor="pointer"
                    maxBarSize={32}
                  >
                    {providers.map((_provider, index) => (
                      <Cell
                        key={`bar-${index}`}
                        fill={palette(index)}
                        cursor="pointer"
                      />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Provider</TableHead>
                  <TableHead>Datacap %</TableHead>
                  <TableHead>Total Size</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {providers.map(
                  ({ provider, percent, total_deal_size }, index) => {
                    return (
                      <TableRow
                        key={index}
                        onMouseEnter={() => setActiveProviderIndex(() => index)}
                        onMouseLeave={() => setActiveProviderIndex(() => -1)}
                        style={{
                          backgroundColor:
                            activeProviderIndex === index
                              ? `${palette(index)}33`
                              : undefined,
                        }}
                      >
                        <TableCell>
                          <Button variant="link" asChild>
                            <Link href={`/storage-providers/${provider}`}>
                              {provider}
                            </Link>
                          </Button>
                        </TableCell>
                        <TableCell>
                          {percentageFormatter.format(
                            parseFloat(percent) / 100
                          )}
                        </TableCell>
                        <TableCell>
                          {filesize(total_deal_size, { standard: "iec" })}
                        </TableCell>
                      </TableRow>
                    );
                  }
                )}
              </TableBody>
            </Table>
          </ResizablePanel>
        </ResizablePanelGroup>
      )}
    </Card>
  );
}

function ActiveShape({
  name,
  cx = 0,
  cy = 0,
  midAngle = 0,
  innerRadius,
  outerRadius = 0,
  startAngle,
  endAngle,
  fill,
  payload,
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
  const provider = payload as Provider;

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
        {name}
      </text>
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        dy={18}
        fontSize={12}
        textAnchor={textAnchor}
        fill="#999"
      >
        {filesize(provider.total_deal_size, { standard: "iec" })} (
        {percentageFormatter.format(parseFloat(provider.percent) / 100)})
      </text>
    </g>
  );
}
