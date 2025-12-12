"use client";

import {
  ChartType,
  ChartTypeTabsSelect,
} from "@/components/chart-type-tabs-select";
import { OverlayLoader } from "@/components/overlay-loader";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QueryKey } from "@/lib/constants";
import { useDelayedFlag } from "@/lib/hooks/use-delayed-flag";
import { ArrayElement } from "@/lib/utils";
import { InfoIcon } from "lucide-react";
import { useCallback, useMemo, useState, type ComponentProps } from "react";
import useSWR from "swr";
import { useDebounceCallback } from "usehooks-ts";
import {
  fetchAllocatorsScoringBreakdown,
  FetchAllocatorsScoringBreakdownParameters,
} from "../allocators-data";
import {
  AllocatorsScoringMetricHistoricalChart,
  type AllocatorsScoringMetricHistoricalChartProps,
} from "./allocators-scoring-metric-historical-chart";
import {
  AllocatorsScoringMetricsSelect,
  type AllocatorsScoringMetricsSelectProps,
} from "./allocators-scoring-metrics-select";

type CheckboxCheckedChangeHandler = NonNullable<
  ComponentProps<typeof Checkbox>["onCheckedChange"]
>;
type ChartMode = NonNullable<
  AllocatorsScoringMetricHistoricalChartProps["mode"]
>;
type DataType = ArrayElement<typeof dataTypes>;
type EnabledChartType = ArrayElement<typeof enabledChartTypes>;
type Threshold = [number, number];
type CardProps = ComponentProps<typeof Card>;

export interface AllocatorsScoringBreakdownWidgetProps
  extends Omit<CardProps, "children"> {
  animationDuration?: number;
  defaultParameters?: FetchAllocatorsScoringBreakdownParameters;
}

const chartModes = ["datacap", "count"] as const satisfies ChartMode[];
const chartModesDict: Record<ChartMode, string> = {
  count: "Count",
  datacap: "Datacap",
};
const dataTypes = ["enterprise", "openData"] as const satisfies Array<
  NonNullable<FetchAllocatorsScoringBreakdownParameters["dataType"]>
>;
const dataTypeDict: Record<DataType, string> = {
  enterprise: "Enterprise",
  openData: "Open Data",
};
const enabledChartTypes = ["area", "bar"] as const satisfies ChartType[];
const syncCheckboxId = "allocators_scoring_breakdown_charts_sync_checkbox";

export function AllocatorsScoringBreakdownWidget({
  animationDuration = 200,
  defaultParameters = {},
  ...rest
}: AllocatorsScoringBreakdownWidgetProps) {
  const [parameters, setParameters] =
    useState<FetchAllocatorsScoringBreakdownParameters>(defaultParameters);
  const { data, isLoading } = useSWR(
    [QueryKey.ALLOCATORS_SCORING_BREAKDOWN, parameters],
    ([, fetchParameters]) => fetchAllocatorsScoringBreakdown(fetchParameters),
    { keepPreviousData: true }
  );
  const isLongLoading = useDelayedFlag(isLoading, 500);
  const [syncEnabled, setSyncEnabled] = useState(true);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [chartMode, setChartMode] = useState<string>(chartModes[0]);
  const [chartType, setChartType] = useState<EnabledChartType>("bar");
  const threshold: Threshold = [
    parameters.mediumScoreThreshold ?? 30,
    parameters.highScoreThreshold ?? 75,
  ];

  const availableMetrics = useMemo<
    AllocatorsScoringMetricsSelectProps["availableMetrics"]
  >(() => {
    if (!data) {
      return [];
    }

    return data.map((entry) => ({
      metric: entry.metric,
      metricName: entry.metricName,
    }));
  }, [data]);

  const visibleMetrics = useMemo(() => {
    if (!data) {
      return [];
    }

    return data.filter((metricData) => {
      return selectedMetrics.includes(metricData.metric);
    });
  }, [data, selectedMetrics]);

  const minIntervalsCount = useMemo(() => {
    const maxIntervals = visibleMetrics.reduce((max, breakdown) => {
      return Math.max(max, breakdown.data.length);
    }, 0);

    return Math.min(maxIntervals, 12);
  }, [visibleMetrics]);

  const handleSyncChecboxCheckedChange =
    useCallback<CheckboxCheckedChangeHandler>((checkedState) => {
      if (checkedState !== "indeterminate") {
        setSyncEnabled(checkedState);
      }
    }, []);

  const updateIntervalFilter = useCallback((value: string) => {
    setParameters((currentParameters) => ({
      ...currentParameters,
      groupBy: value === "week" ? "week" : "month",
    }));
  }, []);

  const handleDataTypeChange = useCallback((value: string) => {
    setParameters((currentParameters) => ({
      ...currentParameters,
      dataType: isAllowedDataType(value) ? value : undefined,
    }));
  }, []);

  const handleThresholdChange = useCallback((threshold: Threshold) => {
    setParameters((currentParameters) => ({
      ...currentParameters,
      mediumScoreThreshold: threshold[0],
      highScoreThreshold: threshold[1],
    }));
  }, []);
  const handleThresholdChangeDebounced = useDebounceCallback(
    handleThresholdChange,
    500
  );

  return (
    <Card {...rest}>
      <div className="p-4">
        <h2 className="text-lg font-medium">Scoring Breakdown</h2>
        <p className="text-xs text-muted-foregroud">
          View Allocators and their Datacap grouped by how their perform in
          given scoring metrics.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between px-4 mb-6">
        <AllocatorsScoringMetricsSelect
          availableMetrics={availableMetrics}
          selectedMetrics={selectedMetrics}
          onSelectedMetricsChange={setSelectedMetrics}
        />

        <div className="flex flex-wrap items-center gap-2 mb-2">
          <div className="flex items-center gap-x-1">
            <Checkbox
              id={syncCheckboxId}
              checked={syncEnabled}
              onCheckedChange={handleSyncChecboxCheckedChange}
            />
            <label htmlFor={syncCheckboxId} className="text-sm">
              Sync Charts
            </label>
          </div>

          <ThresholdSlider
            threshold={threshold}
            onThresholdChange={handleThresholdChangeDebounced}
          />

          <Select
            value={parameters.dataType ?? "all"}
            onValueChange={handleDataTypeChange}
          >
            <SelectTrigger className="bg-background min-w-[152px]">
              <SelectValue placeholder="All Data Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Data Types</SelectItem>
              {dataTypes.map((dataType) => (
                <SelectItem key={dataType} value={dataType}>
                  {dataTypeDict[dataType]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Tabs
            value={parameters.groupBy ?? "week"}
            onValueChange={updateIntervalFilter}
          >
            <TabsList>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
            </TabsList>
          </Tabs>

          <Tabs value={chartMode} onValueChange={setChartMode}>
            <TabsList>
              {chartModes.map((chartMode) => (
                <TabsTrigger key={chartMode} value={chartMode}>
                  {chartModesDict[chartMode]}
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
      </div>

      <div className="flex flex-wrap relative min-h-[200px]">
        {visibleMetrics.map((metricData) => (
          <AllocatorsScoringMetricHistoricalChart
            key={metricData.metric}
            metricName={metricData.metricName}
            metricDescription={metricData.metricDescription}
            data={metricData.data}
            disableSync={!syncEnabled}
            interval={parameters.groupBy ?? "week"}
            mode={chartMode as ChartMode}
            minIntervalsCount={minIntervalsCount}
            animationDuration={animationDuration}
            chartType={chartType}
          />
        ))}

        {selectedMetrics.length === 0 && (
          <p className="flex-1 text-center text-muted-foreground text-sm self-center justify-self-center">
            Select metrics above to see a graph for each of them.
          </p>
        )}

        <OverlayLoader show={!data || isLongLoading} />
      </div>
    </Card>
  );
}

interface ThresholdSliderProps {
  threshold: Threshold;
  onThresholdChange(threshold: Threshold): void;
}

function ThresholdSlider({
  threshold,
  onThresholdChange,
}: ThresholdSliderProps) {
  const handleSliderValueChange = useCallback(
    (value: number[]) => {
      const lowerBound = value[0] ?? 0;
      const nextThreshold: Threshold = [lowerBound, value[1] ?? lowerBound + 1];
      onThresholdChange(nextThreshold);
    },
    [onThresholdChange]
  );

  const helpTrigger = <InfoIcon className="w-5 h-5 text-muted-foreground" />;
  const helpContent = (
    <div className="p-4 md:p-2 font-normal text-sm">
      Use this slider to adjust score threshold for Allocators
      <br />
      <div className="text-muted-foreground">
        eg. {threshold[0]}-{threshold[1]} range means that:
        <ul className="list-disc">
          <li className="m-4">
            Allocator needs a score percentage of at least {threshold[0]}% to be
            considered medium score
          </li>
          <li className="m-4">
            Allocator needs a score percentage of at least {threshold[1]}% to be
            considered high score
          </li>
        </ul>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col mx-2">
      <div className="flex gap-1 items-center justify-between">
        <p className="text-sm">
          Threshold: {threshold[0]} - {threshold[1]}
        </p>

        <Drawer autoFocus>
          <DrawerTrigger className="md:hidden">{helpTrigger}</DrawerTrigger>
          <DrawerContent>{helpContent}</DrawerContent>
        </Drawer>
        <HoverCard>
          <HoverCardTrigger className="hidden md:block">
            {helpTrigger}
          </HoverCardTrigger>
          <HoverCardContent>{helpContent}</HoverCardContent>
        </HoverCard>
      </div>

      <Slider
        className="min-w-[250px]"
        value={threshold}
        max={100}
        min={0}
        step={1}
        onValueChange={handleSliderValueChange}
      />
    </div>
  );
}

function isAllowedDataType(value: string): value is DataType {
  return (dataTypes as string[]).includes(value);
}
