"use client";

import { ChartTooltip } from "@/components/chart-tooltip";
import { OverlayLoader } from "@/components/overlay-loader";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QueryKey } from "@/lib/constants";
import { useDelayedFlag } from "@/lib/hooks/use-delayed-flag";
import { type ArrayElement, cn, isSameMonth, isValidDate } from "@/lib/utils";
import { weekFromDate, weekToReadableString } from "@/lib/weeks";
import { UTCDate } from "@date-fns/utc";
import { filesize } from "filesize";
import { ChartAreaIcon, ChartColumnIcon } from "lucide-react";
import {
  type ComponentProps,
  type ComponentType,
  createElement,
  Fragment,
  type HTMLAttributes,
  useCallback,
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
import useSWR from "swr";
import {
  fetchSLIComplianceHistory,
  type FetchSLIComplianceHistoryParameters,
  type FetchSLIComplianceHistoryReturnType,
} from "../po-rep-data";

type StateValues =
  ArrayElement<FetchSLIComplianceHistoryReturnType>["compliant"];
type WindowSize = ArrayElement<typeof windowSizes>;
type SLIType = ArrayElement<typeof sliTypes>;
type Mode = ArrayElement<typeof modes>;
type ChartType = ArrayElement<typeof chartTypes>;
type ComplianceState = ArrayElement<typeof complianceStates>;
type CardProps = ComponentProps<typeof Card>;

interface SLIComplianceHistoryWidgetProps
  extends Omit<CardProps, "children">,
    Pick<FetchSLIComplianceHistoryParameters, "providerId"> {
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

export function SLIComplianceHistoryWidget({
  animationDuration = 500,
  className,
  providerId,
  ...rest
}: SLIComplianceHistoryWidgetProps) {
  const [windowSize, setWindowSize] = useState<WindowSize>("day");
  const [sliType, setSliType] = useState<SLIType>();
  const [mode, setMode] = useState<Mode>("providersCount");
  const [chartType, setChartType] = useState<ChartType>("area");

  const availableWindowSizes: WindowSize[] =
    sliType === "retrievabilityBps"
      ? ["day", "week", "month"]
      : ["week", "month"];
  const saneWindowSize = availableWindowSizes.includes(windowSize)
    ? windowSize
    : availableWindowSizes[0];

  const parameters: FetchSLIComplianceHistoryParameters = {
    windowSize: saneWindowSize,
    sliType,
    providerId,
  };

  const { data, error, isLoading } = useSWR(
    [QueryKey.PO_REP_SLI_COMPLIANCE_HISTORY, parameters],
    ([, fetchParameters]) => {
      return fetchSLIComplianceHistory(fetchParameters);
    },
    {
      keepPreviousData: true,
    }
  );
  const isLongLoading = useDelayedFlag(isLoading, 5000);

  const handleWindowSizeChange = useCallback((value: string) => {
    setWindowSize(value as WindowSize);
  }, []);

  const handleModeChange = useCallback((value: string) => {
    setMode(value as Mode);
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

      if (saneWindowSize === "month") {
        return new Intl.DateTimeFormat("en-US", {
          month: "short",
          year: "numeric",
          timeZone: "UTC",
        }).format(date);
      }

      if (saneWindowSize === "week") {
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
    [data, saneWindowSize]
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
    <Card {...rest} className={cn("pb-2", className)}>
      <header className="px-4 py-4 max-w-[min(50vw, 200px)]">
        <h3 className="text-lg font-medium">SLI Performance</h3>
        <p className="text-xs text-muted-foreground">
          Overview of Providers performance in fulfilling deals requirements.
        </p>
      </header>

      <div className="px-4 flex flex-wrap items-center gap-2 mb-8">
        <Select value={saneWindowSize} onValueChange={handleWindowSizeChange}>
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
            {modes.map((mode) => (
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

      <div className="relative px-4 pb-4">
        {!!error && (
          <MessageWrapper>
            <p className="text-center text-sm text-muted-foreground">
              An error has occured while loading the data. Please try again
              later.
            </p>
          </MessageWrapper>
        )}

        {!error && !!data && data.length === 1 && (
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

              <YAxis fontSize={12} width="auto" tickFormatter={formatValue} />
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

      <Accordion
        type="single"
        collapsible
        className={cn("mt-6 border-t", className)}
      >
        <AccordionItem className="border-b-0" value="states">
          <AccordionTrigger className="px-4 text-sm">
            What do different states mean?
          </AccordionTrigger>
          <AccordionContent className="px-4 text-justify">
            <p>
              Deal is considered{" "}
              <strong style={{ color: statesColorsMap.compliant }}>
                Compliant
              </strong>{" "}
              if average of selected SLIs measured in given time window fulfills
              deal requirements, otherwise it is considered{" "}
              <strong style={{ color: statesColorsMap.nonCompliant }}>
                Non-compliant
              </strong>
              .{" "}
              <strong style={{ color: statesColorsMap.unknown }}>
                Unknown
              </strong>{" "}
              state refers to deals for which one or more of the selected SLIs
              was not measured in given time window. Provider is considered{" "}
              <strong style={{ color: statesColorsMap.compliant }}>
                Compliant
              </strong>{" "}
              when all of his deals are{" "}
              <strong style={{ color: statesColorsMap.compliant }}>
                Compliant
              </strong>
              .
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
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
