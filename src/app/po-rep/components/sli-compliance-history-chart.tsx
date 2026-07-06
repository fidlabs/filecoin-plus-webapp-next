"use client";

import { ChartTooltip } from "@/components/chart-tooltip";
import { OverlayLoader } from "@/components/overlay-loader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  fetchPoRepSliComplianceHistory,
  type PoRepSliComplianceHistory,
  type PoRepSliComplianceHistoryParameters,
} from "@/lib/cdp";
import { QueryKey } from "@/lib/constants";
import { createFetcherHook } from "@/lib/data-loading";
import { useDelayedFlag } from "@/lib/hooks/use-delayed-flag";
import { type ArrayElement, cn, isSameMonth, isValidDate } from "@/lib/utils";
import { weekFromDate, weekToReadableString } from "@/lib/weeks";
import { UTCDate } from "@date-fns/utc";
import { filesize } from "filesize";
import { ChartAreaIcon, ChartColumnIcon } from "lucide-react";
import {
  type ComponentType,
  createElement,
  Fragment,
  type HTMLAttributes,
  useCallback,
  useMemo,
  useState,
} from "react";
import {
  Area,
  AreaProps,
  Bar,
  BarProps,
  ComposedChart,
  Legend,
  LegendPayload,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type StateValues = ArrayElement<PoRepSliComplianceHistory>["compliant"];
type WindowSize = ArrayElement<typeof windowSizes>;
type SLIType = ArrayElement<typeof sliTypes>;
type Mode = ArrayElement<typeof modes>;
type ChartType = ArrayElement<typeof chartTypes>;
type ComplianceState = ArrayElement<typeof complianceStates>;

interface SLIComplianceHistoryChartProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children">,
    Pick<PoRepSliComplianceHistoryParameters, "providerId"> {
  animationDuration?: number;
}

const statesLabelDict: Record<ComplianceState, string> = {
  compliant: "Compliant",
  nonCompliant: "Non-Compliant",
  unknown: "Unknown",
};
const statesColorsMap: Record<ComplianceState, string> = {
  compliant: "#66a61e",
  nonCompliant: "#ff0029",
  unknown: "orange",
};

const windowSizes = ["day", "week", "month"] as const;
const sliTypes = ["retrievabilityBps", "bandwidthMbps", "latencyMs"] as const;
const modes = [
  "providersCount",
  "providersPercentage",
  "dealsCount",
  "dealsPercentage",
  "totalDealsSize",
  "totalDealsSizePercentage",
] as const satisfies Array<keyof StateValues>;
const chartTypes = ["area", "bar"] as const;
const complianceStates = ["compliant", "nonCompliant", "unknown"] as const;

const windowSizesLabelDict: Record<WindowSize, string> = {
  day: "Daily",
  week: "Weekly",
  month: "Monthly",
};

const sliTypesLabelDict: Record<SLIType, string> = {
  retrievabilityBps: "Retrievability",
  bandwidthMbps: "Bandwidth",
  latencyMs: "Latency",
};

const modesLabelDict: Record<Mode, string> = {
  providersCount: "Providers Count",
  providersPercentage: "Providers Percentage",
  dealsCount: "Deals Count",
  dealsPercentage: "Deals Percentage",
  totalDealsSize: "Deals Size",
  totalDealsSizePercentage: "Deals Size Percentage",
};

const chartTypeLabelIconDict: Record<
  ChartType,
  [string, ComponentType<{ className?: string }>]
> = {
  area: ["Area Chart", ChartAreaIcon],
  bar: ["Bar Chart", ChartColumnIcon],
};

const percentageFormatter = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const useHistory = createFetcherHook(
  fetchPoRepSliComplianceHistory,
  QueryKey.PO_REP_SLI_COMPLIANCE_HISTORY
);

export function SLIComplianceHistoryChart({
  animationDuration = 500,
  className,
  providerId,
  ...rest
}: SLIComplianceHistoryChartProps) {
  const [selectedWindowSize, setSelectedWindowSize] =
    useState<WindowSize>("day");
  const [sliType, setSliType] = useState<SLIType>();
  const [selectedMode, setSelectedMode] = useState<Mode>("providersCount");
  const [chartType, setChartType] = useState<ChartType>("area");

  const availableWindowSizes: WindowSize[] =
    sliType === "retrievabilityBps"
      ? ["day", "week", "month"]
      : ["week", "month"];
  const windowSize = availableWindowSizes.includes(selectedWindowSize)
    ? selectedWindowSize
    : availableWindowSizes[0];

  const availableModes: Mode[] =
    providerId !== undefined
      ? [
          "dealsCount",
          "dealsPercentage",
          "totalDealsSize",
          "totalDealsSizePercentage",
        ]
      : modes;
  const mode = availableModes.includes(selectedMode)
    ? selectedMode
    : availableModes[0];

  const { data, error, isLoading } = useHistory(
    {
      windowSize,
      sliType,
      providerId,
    },
    { keepPreviousData: true }
  );
  const isLongLoading = useDelayedFlag(isLoading, 5000);

  const yAxisTickCount = useMemo<number | undefined>(() => {
    if (
      mode === "dealsPercentage" ||
      mode === "providersPercentage" ||
      mode === "totalDealsSize" ||
      mode === "totalDealsSizePercentage"
    ) {
      return undefined;
    }

    const maxValue =
      data?.reduce((max, entry) => {
        const entrySum =
          entry.compliant[mode] +
          entry.nonCompliant[mode] +
          entry.unknown[mode];

        return Math.max(max, entrySum);
      }, 0) ?? 0;

    return Math.min(maxValue + 1, 5);
  }, [data, mode]);

  const handleWindowSizeChange = useCallback((value: string) => {
    setSelectedWindowSize(value as WindowSize);
  }, []);

  const handleModeChange = useCallback((value: string) => {
    setSelectedMode(value as Mode);
  }, []);

  const handleSliTypeChange = useCallback((value: string) => {
    setSliType(value === "all" ? undefined : (value as SLIType));
  }, []);

  const handleChartTypeChange = useCallback((value: string) => {
    setChartType(value as ChartType);
  }, []);

  const formatXAxisTick = useCallback(
    (value: string) => {
      const date = new UTCDate(value);

      if (!isValidDate(date)) {
        return value;
      }

      if (windowSize === "month") {
        return new Intl.DateTimeFormat("en-US", {
          month: "short",
          year: "numeric",
          timeZone: "UTC",
        }).format(date);
      }

      if (windowSize === "week") {
        return weekToReadableString(weekFromDate(date));
      }

      const currentIndex = data?.findIndex((i) => i.date === value);
      const previousDateString =
        currentIndex !== undefined && currentIndex > 0
          ? data?.at(currentIndex - 1)?.date
          : undefined;
      const previousDate = previousDateString
        ? new UTCDate(previousDateString)
        : undefined;

      if (
        !previousDate ||
        !isValidDate(previousDate) ||
        !isSameMonth(date, previousDate)
      ) {
        return new Intl.DateTimeFormat("en-US", {
          day: "numeric",
          month: "short",
        }).format(date);
      }

      return date.getDate().toString();
    },
    [data, windowSize]
  );

  const formatValue = useCallback(
    (value: string | number) => {
      if (mode === "totalDealsSize") {
        return filesize(value, { standard: "iec" });
      }

      if (mode === "dealsCount" || mode === "providersCount") {
        return String(value);
      }

      return typeof value === "number"
        ? percentageFormatter.format(value)
        : value;
    },
    [mode]
  );

  const formatDate = useCallback((value: string) => {
    const date = new UTCDate(value);

    if (!isValidDate(date)) {
      return value;
    }

    return dateFormatter.format(date);
  }, []);

  const legendItemSorter = useCallback(
    (payload: LegendPayload) => {
      const isVisibleArea = chartType === "area" && payload.type === "line";
      const isVisibleBar = chartType === "bar" && payload.type === "rect";
      return isVisibleArea || isVisibleBar ? 0 : 1;
    },
    [chartType]
  );

  return (
    <div {...rest} className={cn("pb-2", className)}>
      <div className="flex flex-wrap items-center gap-2 mb-8">
        <Select value={windowSize} onValueChange={handleWindowSizeChange}>
          <SelectTrigger className="bg-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableWindowSizes.map((windowSize) => (
              <SelectItem key={windowSize} value={windowSize}>
                {windowSizesLabelDict[windowSize]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={mode} onValueChange={handleModeChange}>
          <SelectTrigger className="bg-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableModes.map((mode) => (
              <SelectItem key={mode} value={mode}>
                {modesLabelDict[mode]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sliType ?? "all"} onValueChange={handleSliTypeChange}>
          <SelectTrigger className="bg-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All SLI Types</SelectItem>
            {sliTypes.map((sliType) => (
              <SelectItem key={sliType} value={sliType}>
                {sliTypesLabelDict[sliType]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={chartType} onValueChange={handleChartTypeChange}>
          <SelectTrigger className="bg-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {chartTypes.map((chartType) => {
              const [label, icon] = chartTypeLabelIconDict[chartType];

              return (
                <SelectItem key={chartType} value={chartType}>
                  <div className="flex items-center gap-2">
                    {createElement(icon, {
                      className: "h-4 w-4",
                    })}
                    {label}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      <div className="relative pb-4">
        {!!error && (
          <MessageWrapper>
            <p className="text-center text-sm text-muted-foreground">
              An error has occured while loading the data. Please try again
              later.
            </p>
          </MessageWrapper>
        )}

        {!error && !!data && data.length < 2 && (
          <MessageWrapper>
            <p className="text-center text-sm text-muted-foreground">
              Not enough data
            </p>
          </MessageWrapper>
        )}

        {!error && !!data && data.length > 1 && (
          <ResponsiveContainer width="100%" height={300} debounce={200}>
            <ComposedChart data={data} barCategoryGap={0} maxBarSize={32}>
              <XAxis
                dataKey="date"
                tickFormatter={formatXAxisTick}
                fontSize={12}
                scale={chartType === "area" ? "point" : undefined}
              />

              <YAxis
                fontSize={12}
                width="auto"
                tickFormatter={formatValue}
                tickCount={yAxisTickCount}
              />
              <Legend
                itemSorter={legendItemSorter}
                payloadUniqBy
                iconType="rect"
                wrapperStyle={{
                  fontSize: 12,
                }}
              />

              <Tooltip<string | number, string>
                labelFormatter={formatDate}
                formatter={formatValue}
                content={ChartTooltip}
              />

              {complianceStates.map((state) => {
                const commonProps: AreaProps & BarProps = {
                  dataKey: `${state}.${mode}`,
                  name: statesLabelDict[state],
                  animationDuration,
                  fill: statesColorsMap[state],
                  stroke: statesColorsMap[state],
                };

                return (
                  <Fragment key={`${state}_chart_elements`}>
                    <Area
                      {...commonProps}
                      hide={chartType !== "area"}
                      type="monotone"
                      stackId="areas"
                    />
                    <Bar
                      {...commonProps}
                      hide={chartType !== "bar"}
                      stackId="bars"
                    />
                  </Fragment>
                );
              })}
            </ComposedChart>
          </ResponsiveContainer>
        )}
        <OverlayLoader show={!data || isLongLoading} />
      </div>
    </div>
  );
}

function MessageWrapper({
  children,
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...rest}
      className={cn("h-[300px] flex items-center justify-center", className)}
    >
      {children}
    </div>
  );
}
