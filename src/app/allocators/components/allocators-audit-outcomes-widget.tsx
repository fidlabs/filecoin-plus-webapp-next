"use client";

import { ChartTooltip } from "@/components/chart-tooltip";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QueryKey } from "@/lib/constants";
import { ComponentProps, useCallback, useMemo, useState } from "react";
import {
  Area,
  Bar,
  ComposedChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Formatter } from "recharts/types/component/DefaultTooltipContent";
import useSWR from "swr";
import {
  fetchAllocatorsAuditOutcomes,
  FetchAllocatorsAuditOutcomesParameters,
  FetchAllocatorsAuditOutcomesReturnType,
} from "../allocators-data";
import { useDelayedFlag } from "@/lib/hooks/use-delayed-flag";
import { OverlayLoader } from "@/components/overlay-loader";
import { ArrayElement } from "@/lib/utils";
import {
  ChartType,
  ChartTypeTabsSelect,
} from "@/components/chart-type-tabs-select";
import { useDynamicBarsCount } from "@/lib/hooks/use-dynamic-bars-count";

type ChartEntry = {
  [K in keyof FetchAllocatorsAuditOutcomesReturnType[number]["datacap"]]: number;
} & { month: string };
type CardProps = ComponentProps<typeof Card>;

export interface AllocatorsAuditOutcomesWidgetProps
  extends Omit<CardProps, "children"> {
  animationDuration?: number;
}

type EnabledChartType = ArrayElement<typeof enabledChartTypes>;
type Outcome = ArrayElement<typeof outcomes>;

const scales = ["linear", "percentage"] as const;
const modes = ["datacap", "count"] as const;
const enabledChartTypes = ["area", "bar"] as const satisfies ChartType[];
const outcomes = [
  "passed",
  "passedConditionally",
  "failed",
  "notAudited",
  "unknown",
] as const satisfies Array<Omit<keyof ChartEntry, "month">>;

const scalesLabelDict: Record<ArrayElement<typeof scales>, string> = {
  linear: "Linear",
  percentage: "Percentage",
};

const modesLabelDict: Record<ArrayElement<typeof modes>, string> = {
  datacap: "PiB",
  count: "Count",
};

const outcomesLabelDict: Record<Outcome, string> = {
  passed: "Passed",
  passedConditionally: "Passed Conditionally",
  failed: "Failed",
  notAudited: "Not Audited",
  unknown: "Unknown",
};

const percentageFormatter = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 2,
});

const colors: Record<Outcome, string> = {
  passed: "#66a61e",
  passedConditionally: "#cf8c00",
  failed: "#ff0029",
  notAudited: "#888",
  unknown: "#525252",
};

export function AllocatorsAuditOutcomesWidget({
  animationDuration = 500,
  ...rest
}: AllocatorsAuditOutcomesWidgetProps) {
  const [mode, setMode] = useState<string>(modes[0]);
  const [scale, setScale] = useState<string>(scales[0]);
  const [chartType, setChartType] = useState<EnabledChartType>("bar");
  const { chartWrapperRef, barsCount } = useDynamicBarsCount({
    minBarSize: 12,
    margins: 116,
  });
  const [parameters, setParameters] =
    useState<FetchAllocatorsAuditOutcomesParameters>({
      editionId: "6",
    });
  const { data, isLoading } = useSWR(
    [QueryKey.ALLOCATORS_AUDIT_OUTCOMES, parameters],
    ([, fetchParameters]) => fetchAllocatorsAuditOutcomes(fetchParameters)
  );
  const isLongLoading = useDelayedFlag(isLoading, 500);

  const chartData = useMemo<ChartEntry[]>(() => {
    if (!data) {
      return [];
    }

    return data.map<ChartEntry>((item) => {
      return {
        month: new Date(item.month).toLocaleDateString("en-US", {
          month: "short",
          year: "2-digit",
        }),
        ...(mode === "datacap" ? item.datacap : item.count),
      };
    });
  }, [data, mode]);

  const formatValue = useCallback(
    (value: number) => {
      if (scale === "percentage") {
        return percentageFormatter.format(value);
      }

      return mode === "count" ? String(value) : toPiBs(value);
    },
    [mode, scale]
  );

  const formatTooltipValue = useCallback<
    Formatter<number | string, string | number>
  >(
    (value, name, _item, _index, payload) => {
      if (typeof value !== "number" || name === "month") {
        return value;
      }

      if (scale === "percentage") {
        const total = payload
          .filter((item) => {
            return item.name !== "month";
          })
          .map((item) => {
            return item.value;
          })
          .filter((maybeValue): maybeValue is number => {
            return typeof maybeValue === "number";
          })
          .reduce((sum, value) => {
            return sum + value;
          }, 0);

        return percentageFormatter.format(total !== 0 ? value / total : 0);
      }

      return mode === "datacap" ? toPiBs(value) : String(value);
    },
    [mode, scale]
  );

  const handleEditionChange = useCallback((editionId: string) => {
    setParameters((currentParameters) => ({
      ...currentParameters,
      editionId,
    }));
  }, []);

  return (
    <Card {...rest}>
      <header className="p-4 flex flex-wrap items-center justify-between">
        <h3 className="text-lg font-medium">Audit Outcomes</h3>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={parameters.editionId}
            onValueChange={handleEditionChange}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="All Editions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">Edition 5</SelectItem>
              <SelectItem value="6">Edition 6</SelectItem>
            </SelectContent>
          </Select>

          <Tabs value={scale} onValueChange={setScale}>
            <TabsList>
              {scales.map((possibleScale) => (
                <TabsTrigger key={possibleScale} value={possibleScale}>
                  {scalesLabelDict[possibleScale]}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <Tabs value={mode} onValueChange={setMode}>
            <TabsList>
              {modes.map((possibleMode) => (
                <TabsTrigger key={possibleMode} value={possibleMode}>
                  {modesLabelDict[possibleMode]}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <ChartTypeTabsSelect
            chartType={chartType}
            enable={enabledChartTypes}
            onChartTypeChange={setChartType}
          />
        </div>
      </header>

      <div className="relative">
        <ResponsiveContainer
          ref={chartWrapperRef}
          width="100%"
          height={400}
          debounce={200}
        >
          <ComposedChart
            data={chartType === "bar" ? chartData.slice(-barsCount) : chartData}
            margin={{
              top: 16,
              right: 16,
            }}
            stackOffset={scale === "percentage" ? "expand" : "none"}
          >
            <XAxis
              dataKey="month"
              type="category"
              interval={0}
              fontSize={12}
              tickMargin={6}
              padding={{
                right: 16,
              }}
            />
            <YAxis type="number" tickFormatter={formatValue} fontSize={12} />

            {outcomes.map((outcome) => {
              switch (chartType) {
                case "area":
                  return (
                    <Area
                      key={`${outcome}_area`}
                      dataKey={outcome}
                      type="monotone"
                      stackId="areas"
                      fill={colors[outcome]}
                      stroke={colors[outcome]}
                      name={outcomesLabelDict[outcome]}
                      animationDuration={animationDuration}
                    />
                  );
                case "bar":
                  return (
                    <Bar
                      key={`${outcome}_bar`}
                      dataKey={outcome}
                      stackId="bars"
                      fill={colors[outcome]}
                      stroke="#000"
                      strokeWidth={1}
                      name={outcomesLabelDict[outcome]}
                      animationDuration={animationDuration}
                      maxBarSize={48}
                    />
                  );
              }
            })}

            <Legend
              align="center"
              verticalAlign="bottom"
              iconType="rect"
              wrapperStyle={{
                fontSize: 12,
              }}
            />
            <Tooltip formatter={formatTooltipValue} content={ChartTooltip} />
          </ComposedChart>
        </ResponsiveContainer>
        <OverlayLoader show={!data || isLongLoading} />
      </div>

      <div className="p-4">
        <h5 className="text-sm font-semibold mb-2">What is this chart?</h5>
        <p className="text-xs mb-1">
          The Fil+ Governance Team conducts audits of the Allocators when an
          Allocator is at 75% of DataCap tranche usage. Based on the historical
          behaviour of the Allocator, the team decides the size of the next
          allocation of Data Cap:
        </p>
        <ul className="text-xs list-disc">
          <li className="ml-4">
            If the Allocator showed compliance, they will receive the same or
            double the previous DataCap allocation.
          </li>
          <li className="ml-4">
            If the Allocator breached some of their rules, the Governance Team
            may decide they are partially compliant and allocate half of the
            previous allocation, giving an Allocator a chance to build up trust
            again.
          </li>
          <li className="ml-4">
            If the Allocator exhibited gross misconduct, they will be deemed
            non-compliant and will not receive any more DataCap.
          </li>
          <li className="ml-4">
            Non audited Allocators have not yet used up their initial 5PiBs of
            DataCap allocation
          </li>
        </ul>
      </div>
    </Card>
  );
}

function toPiBs(value: number): string {
  return value + " PiB" + (value === 1 ? "" : "s");
}
