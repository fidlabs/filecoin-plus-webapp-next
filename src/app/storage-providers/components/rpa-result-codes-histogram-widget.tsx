"use client";

import { ChartStat } from "@/components/chart-stat";
import { ChartTooltip } from "@/components/chart-tooltip";
import { OverlayLoader } from "@/components/overlay-loader";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { QueryKey } from "@/lib/constants";
import { useDelayedFlag } from "@/lib/hooks/use-delayed-flag";
import { cn, isValidDate, palette } from "@/lib/utils";
import { get } from "lodash";
import {
  type ComponentProps,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Formatter,
  NameType,
} from "recharts/types/component/DefaultTooltipContent";
import useSWR from "swr";
import {
  fetchRpaResultCodesHistogram,
  RpaResultCode,
} from "../storage-providers-data";

type CheckboxProps = ComponentProps<typeof Checkbox>;
type CheckboxCheckedChangeHandler = NonNullable<
  CheckboxProps["onCheckedChange"]
>;
type CardProps = ComponentProps<typeof Card>;

export interface RpaResultCodesHistogramWidgetProps extends CardProps {
  animationDuration?: number;
}

type Results = Record<string, { count: number; percentage: number }>;

interface ChartDataEntry {
  date: string;
  results: Results;
}

type DateLike = Date | string | number;

const disabledColor = "#AAA";
const otherGroupKey = "Other";
const dateMonthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
});
const dateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  year: "numeric",
});
const percentageFormatter = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 2,
});

function isSameMonth(a: DateLike, b: DateLike): boolean {
  const dateA = new Date(a);
  const dateB = new Date(b);

  return (
    isValidDate(dateA) &&
    isValidDate(dateB) &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getFullYear() === dateB.getFullYear()
  );
}

function getColorForResultCode(
  resultCode: string,
  resultCodeIndex: number
): string {
  switch (resultCode) {
    case otherGroupKey:
      return disabledColor;
    case RpaResultCode.SUCCESS:
      return "#66a61e";
    default:
      return palette(3 + resultCodeIndex);
  }
}

export function RpaResultCodesHistogramWidget({
  animationDuration = 250,
  className,
  ...rest
}: RpaResultCodesHistogramWidgetProps) {
  const { data, error, isLoading, mutate } = useSWR(
    QueryKey.RPA_RESULT_CODES_HISTOGRAM,
    fetchRpaResultCodesHistogram,
    {
      keepPreviousData: true,
      revalidateOnMount: false,
    }
  );
  const isLongLoading = useDelayedFlag(isLoading, 500);
  const [disabledResultCodes, setDisabledResultCodes] = useState<string[]>([]);

  const resultCodes = useMemo(() => {
    if (!data) {
      return [otherGroupKey];
    }

    return [otherGroupKey, ...Object.keys(data.metadata)];
  }, [data]);

  const testedStorageProvidersStat = useMemo<
    [number, number | undefined]
  >(() => {
    const [currentDay, previousDay] = data?.days ?? [];
    const count = currentDay ? currentDay.total : 0;
    const change =
      !previousDay || previousDay.total === 0
        ? 0
        : currentDay.total / previousDay.total - 1;

    return [count, change];
  }, [data]);

  const successfulMeasurmentsStat = useMemo<
    [number, number | undefined]
  >(() => {
    const [currentDaySuccessResult, previousDaySuccessResult] =
      data?.days.slice(0, 2).map((day) => {
        return day.results.find(
          (result) => result.code === RpaResultCode.SUCCESS
        );
      }) ?? [];
    const count = currentDaySuccessResult ? currentDaySuccessResult.count : 0;
    const change =
      !currentDaySuccessResult ||
      !previousDaySuccessResult ||
      previousDaySuccessResult.count === 0
        ? 0
        : currentDaySuccessResult.count / previousDaySuccessResult.count - 1;

    return [count, change];
  }, [data]);

  const chartData = useMemo<ChartDataEntry[]>(() => {
    if (!data) {
      return [];
    }

    return data.days.map<ChartDataEntry>((day) => {
      const results = day.results.reduce<Results>((acc, item) => {
        if (disabledResultCodes.includes(item.code)) {
          const currentOtherGroup = acc[otherGroupKey];

          return {
            ...acc,
            [otherGroupKey]: {
              count: currentOtherGroup?.count ?? 0 + item.count,
              percentage: currentOtherGroup?.percentage ?? 0 + item.percentage,
            },
          };
        }

        return {
          ...acc,
          [item.code]: item,
        };
      }, {});

      return {
        date: day.day,
        results,
      };
    }, []);
  }, [data, disabledResultCodes]);

  const formatXAxisTick = useCallback(
    (value: unknown, index: number) => {
      if (typeof value !== "string" && typeof value !== "number") {
        return String(value);
      }

      const date = new Date(value);
      const previousEntry = chartData[index - 1];
      return !!previousEntry && isSameMonth(date, previousEntry.date)
        ? date.getDate().toString()
        : `${date.getDate()} ${dateMonthFormatter.format(date)}`;
    },
    [chartData]
  );

  const formatDate = useCallback((value: unknown) => {
    if (typeof value !== "string") {
      return String(value);
    }

    const date = new Date(value);
    return isValidDate(date) ? dateFormatter.format(date) : String(date);
  }, []);

  const formatValue = useCallback((value: string | number) => {
    const numericValue = typeof value === "string" ? parseFloat(value) : value;

    if (isNaN(numericValue)) {
      return String(value);
    }

    return percentageFormatter.format(numericValue);
  }, []);

  const formatTooltipValue = useCallback<Formatter<number | string, NameType>>(
    (value, _name, payload) => {
      const numericValue =
        typeof value === "string" ? parseFloat(value) : value;

      if (isNaN(numericValue)) {
        return String(value);
      }

      if (typeof payload.dataKey !== "string") {
        return percentageFormatter.format(numericValue);
      }

      const countKey =
        payload.dataKey.split(".").slice(0, -1).join(".") + ".count";
      return `${percentageFormatter.format(numericValue)} (${get(payload.payload, countKey)})`;
    },
    []
  );

  const handleResultCodeToggle = useCallback(
    (resultCode: string, enabled: boolean) => {
      setDisabledResultCodes((currentDisabledResultCodes) => {
        return enabled
          ? currentDisabledResultCodes.filter(
              (candidate) => candidate !== resultCode
            )
          : [...currentDisabledResultCodes, resultCode];
      });
    },
    []
  );

  useEffect(() => {
    if (!data && !error && !isLoading) {
      mutate();
    }
  }, [data, error, isLoading, mutate]);

  return (
    <Card {...rest} className={cn("pb-4", className)}>
      <header className="p-4 mb-4">
        <h3 className="text-lg font-medium">RPA Result Codes</h3>
        <p className="text-xs text-muted-foreground">
          Histogram of result codes returned when measuring Storage Providers
          Random Piece Availability
        </p>
      </header>

      <div className="px-4 mb-8">
        <div className="flex flex-wrap gap-x-8">
          <ChartStat
            label="Tested SP Count"
            value={testedStorageProvidersStat[0]}
            percentageChange={testedStorageProvidersStat[1]}
          />

          <ChartStat
            label="Succesful Measurements"
            value={successfulMeasurmentsStat[0]}
            percentageChange={successfulMeasurmentsStat[1]}
          />
        </div>
      </div>

      <div className="relative">
        <ResponsiveContainer width="100%" height={454} debounce={200}>
          <BarChart
            data={chartData}
            barGap={0}
            barCategoryGap={0}
            margin={{
              left: 16,
              right: 16,
            }}
          >
            <XAxis
              dataKey="date"
              fontSize={12}
              tickFormatter={formatXAxisTick}
            />
            <YAxis fontSize={14} tickFormatter={formatValue} width="auto" />

            <Tooltip
              labelFormatter={formatDate}
              formatter={formatTooltipValue}
              content={ChartTooltip}
            />

            {resultCodes.map((resultCode, resultCodeIndex) => {
              const color = getColorForResultCode(resultCode, resultCodeIndex);

              return (
                <Bar
                  key={`${resultCode}_area`}
                  name={data?.metadata?.[resultCode]?.name ?? resultCode}
                  stackId="areas"
                  dataKey={`results.${resultCode}.percentage`}
                  fill={color}
                  animationDuration={animationDuration}
                />
              );
            })}
          </BarChart>
        </ResponsiveContainer>
        {<OverlayLoader show={!data || isLongLoading} />}
      </div>

      <div className="p-4 flex flex-wrap gap-2">
        {resultCodes.map((resultCode, resultCodeIndex) => {
          if (resultCode === otherGroupKey) {
            return null;
          }

          const color = getColorForResultCode(resultCode, resultCodeIndex);
          const name = data?.metadata[resultCode]?.name ?? resultCode;
          const description = data?.metadata[resultCode]?.description;
          const enabled = !disabledResultCodes.includes(resultCode);

          return (
            <LegendItem
              key={`${resultCode}_legend_item`}
              resultCode={resultCode}
              color={color}
              enabled={enabled}
              name={name}
              description={description}
              onToggleResultCode={handleResultCodeToggle}
            />
          );
        })}
      </div>
    </Card>
  );
}

interface LegendItemProps {
  color: string;
  description?: string;
  enabled: boolean;
  name: string;
  resultCode: string;
  onToggleResultCode(resultCode: string, enabled: boolean): void;
}

function LegendItem({
  color,
  description,
  enabled,
  name,
  resultCode,
  onToggleResultCode,
}: LegendItemProps) {
  const checkboxId = `${resultCode}_legend_checkbox`;
  const mergedColor = enabled ? color : disabledColor;

  const handleCheckboxCheckedChange = useCallback<CheckboxCheckedChangeHandler>(
    (checkedState) => {
      onToggleResultCode(resultCode, checkedState === true);
    },
    [resultCode, onToggleResultCode]
  );

  return (
    <div
      className="border rounded-full px-4 py-1                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       relative overflow-hidden"
      style={{
        borderColor: mergedColor,
      }}
    >
      <div
        className="absolute inset-0 opacity-20"
        style={{ backgroundColor: mergedColor }}
      />
      <div className="flex items-center gap-2 relative z-10">
        <Checkbox
          id={checkboxId}
          checked={enabled}
          onCheckedChange={handleCheckboxCheckedChange}
          style={{
            backgroundColor: enabled ? color : undefined,
            borderColor: mergedColor,
          }}
        />
        <label htmlFor={checkboxId} className="cursor-pointer">
          <h5 className="text-xs font-medium">{name}</h5>
          {!!description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </label>
      </div>
    </div>
  );
}
