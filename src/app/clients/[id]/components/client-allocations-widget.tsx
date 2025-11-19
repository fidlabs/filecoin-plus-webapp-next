"use client";

import {
  ChartTooltipContainer,
  ChartTooltipGrid,
  ChartTooltipHeader,
  ChartTooltipTitle,
} from "@/components/chart-tooltip";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { QueryKey } from "@/lib/constants";
import { calculateDateFromHeight, cn } from "@/lib/utils";
import { filesize } from "filesize";
import Link from "next/link";
import { type ComponentProps, useCallback, useMemo, useState } from "react";
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
import { CategoricalChartFunc } from "recharts/types/chart/types";
import useSWR from "swr";
import { fetchClientAllocations } from "../../clients-data";

interface ChartEntry {
  date: string;
  allocatorId: string;
  allocatedDatacap: number;
  totalDatacap: number;
}

interface AllocationsTableEntry {
  allocatorId: string;
  totalSize: bigint;
  date: string | null;
}

interface AllocatorsTableEntry {
  allocatorId: string;
  totalSize: bigint;
}

type CardProps = ComponentProps<typeof Card>;
export interface ClientAllocationsWidgetProps
  extends Omit<CardProps, "children"> {
  clientId: string;
}

function toIECBytes(value: string | number | bigint): string {
  return filesize(value, { standard: "iec" });
}

function toShortDate(value: string | number): string {
  return new Date(value).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function ClientAllocationsWidget({
  clientId,
  ...rest
}: ClientAllocationsWidgetProps) {
  const [activeIndex, setActiveIndex] = useState(-1);
  const { data: allocationsResponse, error } = useSWR(
    [QueryKey.CLIENT_ALLOCATIONS, { clientId }],
    ([, fetchParameters]) => fetchClientAllocations(fetchParameters),
    {
      keepPreviousData: true,
    }
  );

  const chartData = useMemo<ChartEntry[]>(() => {
    if (!allocationsResponse) {
      return [];
    }

    return allocationsResponse.data
      .flatMap((client) => client.allowanceArray)
      .sort((a, b) => {
        return a.height - b.height;
      })
      .reduce<ChartEntry[]>((result, allowanceArrayEntry, currentIndex) => {
        const total =
          currentIndex > 0 ? BigInt(result[currentIndex - 1].totalDatacap) : 0n;
        const allowance = BigInt(allowanceArrayEntry.allowance);

        const entry: ChartEntry = {
          date: calculateDateFromHeight(allowanceArrayEntry.height),
          allocatorId: allowanceArrayEntry.verifierAddressId,
          allocatedDatacap: Number(allowance),
          totalDatacap: Number(total + allowance),
        };

        return [...result, entry];
      }, []);
  }, [allocationsResponse]);

  const allocationsTableData = useMemo<AllocationsTableEntry[]>(() => {
    if (!allocationsResponse) {
      return [];
    }

    return allocationsResponse.data
      .flatMap((client) => client.allowanceArray)
      .sort((a, b) => {
        return b.height - a.height;
      })
      .map<AllocationsTableEntry>((allowanceArrayEntry) => {
        return {
          allocatorId: allowanceArrayEntry.verifierAddressId,
          totalSize: BigInt(allowanceArrayEntry.allowance),
          date: calculateDateFromHeight(allowanceArrayEntry.height),
        };
      });
  }, [allocationsResponse]);

  const allocatorsTableData = useMemo<AllocatorsTableEntry[]>(() => {
    if (!allocationsResponse) {
      return [];
    }

    return allocationsResponse.data.map<AllocatorsTableEntry>((entry) => {
      return {
        allocatorId: entry.verifierAddressId,
        totalSize: BigInt(entry.initialAllowance),
      };
    });
  }, [allocationsResponse]);

  const handleChartMouseMove = useCallback<CategoricalChartFunc>((state) => {
    const activeIndex =
      typeof state.activeIndex !== "undefined" && state.activeIndex !== null
        ? parseInt(state.activeIndex.toString())
        : -1;

    setActiveIndex(activeIndex);
  }, []);

  const handleChartMouseLeave = useCallback(() => {
    setActiveIndex(-1);
  }, []);

  return (
    <Card {...rest}>
      <header className="p-4 mb-4">
        <h3 className="text-lg font-medium">Allocations</h3>
        <p className="text-xs text-muted-foreground">
          Browse Client Allocations and Total Allocated Datacap over time
        </p>
      </header>

      <div>
        {!!error && (
          <div className="px-4 py-8">
            <p className="text-center text-sm text-muted-foreground">
              Could not load allocations data. Please try again later.
            </p>
          </div>
        )}

        {!error && (
          <>
            <ResponsiveContainer
              className="mb-4"
              width="100%"
              height={250}
              debounce={200}
            >
              <ComposedChart
                data={chartData}
                margin={{
                  right: 16,
                  left: 16,
                  top: 16,
                }}
                onMouseMove={handleChartMouseMove}
                onMouseLeave={handleChartMouseLeave}
              >
                <XAxis
                  dataKey="date"
                  width="auto"
                  tickFormatter={toShortDate}
                  fontSize={14}
                />
                <YAxis tickFormatter={toIECBytes} fontSize={14} />

                <Tooltip
                  formatter={toIECBytes}
                  labelFormatter={toShortDate}
                  content={CustomTooltipContent}
                  defaultIndex={activeIndex}
                  active={activeIndex !== -1}
                />

                <Area
                  type="monotone"
                  dataKey="totalDatacap"
                  name="Total"
                  fill="hsl(var(--color-dodger-blue))"
                  stroke="hsl(var(--color-dodger-blue))"
                />
                <Bar
                  dataKey="allocatedDatacap"
                  name="Allocated"
                  maxBarSize={32}
                  fill="var(--color-link)"
                />
              </ComposedChart>
            </ResponsiveContainer>
            <Accordion type="multiple" defaultValue={["allocations"]}>
              <AccordionItem value="allocations">
                <AccordionTrigger className="px-4 text-sm">
                  Allocations
                </AccordionTrigger>
                <AccordionContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Allocator ID</TableHead>
                        <TableHead>Total Size</TableHead>
                        <TableHead className="text-right">
                          Allocation Date
                        </TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {allocationsTableData.map((tableEntry, index) => {
                        const chartIndex =
                          allocationsTableData.length - index - 1;

                        return (
                          <TableRow
                            key={`${tableEntry.allocatorId}_${index}`}
                            className={cn(
                              "hover:bg-dodger-blue/30",
                              activeIndex === chartIndex && "bg-dodger-blue/30"
                            )}
                            onMouseEnter={() =>
                              setActiveIndex(() => chartIndex)
                            }
                            onMouseLeave={() => setActiveIndex(() => -1)}
                          >
                            <TableCell>
                              <Button variant="link" asChild>
                                <Link
                                  href={`/allocators/${tableEntry.allocatorId}`}
                                >
                                  {tableEntry.allocatorId}
                                </Link>
                              </Button>
                            </TableCell>

                            <TableCell>
                              {toIECBytes(tableEntry.totalSize)}
                            </TableCell>

                            <TableCell className="text-right">
                              {tableEntry.date
                                ? toShortDate(tableEntry.date)
                                : ""}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="allocators">
                <AccordionTrigger className="px-4 text-sm">
                  Allocators
                </AccordionTrigger>
                <AccordionContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Allocator ID</TableHead>
                        <TableHead className="text-right">Total Size</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {allocatorsTableData.map((tableEntry) => (
                        <TableRow key={tableEntry.allocatorId}>
                          <TableCell>
                            <Button variant="link" asChild>
                              <Link
                                href={`/allocators/${tableEntry.allocatorId}`}
                              >
                                {tableEntry.allocatorId}
                              </Link>
                            </Button>
                          </TableCell>

                          <TableCell className="text-right">
                            {toIECBytes(tableEntry.totalSize)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </>
        )}
      </div>
    </Card>
  );
}

function CustomTooltipContent(
  props: TooltipContentProps<number | string, string>
) {
  if (!props.payload || props.payload.length === 0) {
    return null;
  }

  const labelText = props.labelFormatter
    ? props.labelFormatter(props.label, props.payload ?? [])
    : props.label;

  const allocatorId = props.payload?.[0]?.payload?.allocatorId;

  return (
    <ChartTooltipContainer>
      <ChartTooltipHeader>
        <ChartTooltipTitle>{labelText}</ChartTooltipTitle>

        {typeof allocatorId === "string" && (
          <p className="text-sm">
            From: <strong className="font-semibold">{allocatorId}</strong>
          </p>
        )}
      </ChartTooltipHeader>

      <ChartTooltipGrid payload={props.payload} formatter={props.formatter} />
    </ChartTooltipContainer>
  );
}
