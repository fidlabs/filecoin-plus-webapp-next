"use client";

import { ChartStat } from "@/components/chart-stat";
import { Card } from "@/components/ui/card";
import { QueryKey } from "@/lib/constants";
import { isSameMonth, isValidDate } from "@/lib/utils";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ComponentProps,
} from "react";
import {
  Area,
  Bar,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CategoricalChartFunc } from "recharts/types/chart/types";
import useSWR from "swr";
import { fetchPoRepPaymentsHistory } from "../po-rep-data";

type CardProps = ComponentProps<typeof Card>;
export type PoRepMoneyFlowWidgetProps = Omit<CardProps, "children">;

const dateMonthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const numericFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
  notation: "compact",
});

const unit = "USD";
const syncId = "po-rep-money-flow-charts";

export function PoRepMoneyFlowWidget(props: PoRepMoneyFlowWidgetProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const { data, error, isLoading, mutate } = useSWR(
    QueryKey.PO_REP_PAYMENTS_HISTORY,
    fetchPoRepPaymentsHistory,
    {
      keepPreviousData: true,
      revalidateOnMount: false,
    }
  );

  useEffect(() => {
    if (!data && !error && !isLoading) {
      mutate();
    }
  }, [data, error, isLoading, mutate]);

  const chartData = useMemo(() => {
    return data ?? [];
  }, [data]);

  const activeIndex = hoverIndex === null ? chartData.length - 1 : hoverIndex;
  const activeElement = chartData.at(activeIndex);

  const formatXAxisTick = useCallback(
    (value: unknown, index: number) => {
      if (typeof value !== "string" && typeof value !== "number") {
        return String(value);
      }

      const date = new Date(value);
      const previousEntry = chartData[index - 1];
      return !!previousEntry && isSameMonth(date, previousEntry.day)
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

  const formatTick = useCallback((value: string | number) => {
    if (typeof value === "number") {
      return numericFormatter.format(value);
    }

    return String(value);
  }, []);

  const formatValue = useCallback((value: string | number) => {
    if (typeof value === "number") {
      return numericFormatter.format(value) + ` ${unit}`;
    }

    return String(value);
  }, []);

  const {
    cumulativeAmount,
    cumulativeAmountChange,
    currentDailyAmount,
    currentDailyAmountChange,
  } = useMemo<{
    cumulativeAmount: string;
    cumulativeAmountChange: number | undefined;
    currentDailyAmount: string;
    currentDailyAmountChange: number | undefined;
  }>(() => {
    const currentEntry = chartData.at(-1);

    if (!currentEntry) {
      return {
        cumulativeAmount: "N/A",
        cumulativeAmountChange: undefined,
        currentDailyAmount: "N/A",
        currentDailyAmountChange: undefined,
      };
    }

    const previousEntry = chartData.at(-2);

    if (!previousEntry) {
      return {
        cumulativeAmount: formatValue(currentEntry.cumulativeAmountUSD),
        cumulativeAmountChange: undefined,
        currentDailyAmount: formatValue(currentEntry.dailyAmountUSD),
        currentDailyAmountChange: undefined,
      };
    }

    const cumulativeAmountChange =
      previousEntry.cumulativeAmountUSD === 0
        ? undefined
        : currentEntry.cumulativeAmountUSD / previousEntry.cumulativeAmountUSD -
          1;
    const currentDailyAmountChange =
      previousEntry.dailyAmountUSD === 0
        ? undefined
        : currentEntry.dailyAmountUSD / previousEntry.dailyAmountUSD - 1;

    return {
      cumulativeAmount: formatValue(currentEntry.cumulativeAmountUSD),
      cumulativeAmountChange,
      currentDailyAmount: formatValue(currentEntry.dailyAmountUSD),
      currentDailyAmountChange,
    };
  }, [chartData, formatValue]);

  const handleChartMouseMove = useCallback<CategoricalChartFunc>(
    ({ activeTooltipIndex }) => {
      if (
        typeof activeTooltipIndex === "undefined" ||
        activeTooltipIndex === null
      ) {
        setHoverIndex(null);
      } else {
        const activeIndexNumber =
          typeof activeTooltipIndex === "string"
            ? parseInt(activeTooltipIndex, 10)
            : activeTooltipIndex;
        setHoverIndex(isNaN(activeIndexNumber) ? null : activeIndexNumber);
      }
    },
    []
  );

  const handleChartMouseLeave = useCallback<CategoricalChartFunc>(() => {
    setHoverIndex(null);
  }, []);

  return (
    <Card {...props}>
      <header className="px-4 pt-6 mb-4">
        <h3 className="text-lg font-medium">Money Flow</h3>
        <p className="text-xs text-muted-foreground">
          Total amount of USD that has flown to the SPs for fullfilling their
          deals
        </p>
      </header>

      <div className="px-4 mb-6 flex flex-wrap gap-x-8 gap-y-2">
        <ChartStat
          label="Cumulative Total"
          value={cumulativeAmount}
          percentageChange={cumulativeAmountChange}
        />

        <ChartStat
          label="Latest Daily Volume"
          value={currentDailyAmount}
          percentageChange={currentDailyAmountChange}
        />
      </div>

      <div>
        {!!activeElement && (
          <div className="px-4 mb-2">
            <p className="text-sm">
              Cumulative Total @ {formatDate(activeElement.day)}
              {": "}
              <strong>{formatValue(activeElement.cumulativeAmountUSD)}</strong>
            </p>
          </div>
        )}
        <ResponsiveContainer width="100%" height={230} debounce={50}>
          <ComposedChart
            syncId={syncId}
            data={chartData}
            maxBarSize={24}
            onMouseMove={handleChartMouseMove}
            onMouseLeave={handleChartMouseLeave}
          >
            <XAxis dataKey="day" fontSize={12} hide />
            <YAxis width={40} fontSize={12} tickFormatter={formatTick} />
            <Tooltip content={EmptyTooltip} />

            <Area
              dataKey="cumulativeAmountUSD"
              name="Cumulative Amount"
              fill="var(--chart-2)"
              stroke="var(--chart-2)"
            />

            <Bar dataKey="cumulativeAmountUSD" hide />
          </ComposedChart>
        </ResponsiveContainer>

        {!!activeElement && (
          <div className="px-4 my-2">
            <p className="text-sm">
              Volume @ {formatDate(activeElement.day)}
              {": "}
              <strong>{formatValue(activeElement.dailyAmountUSD)}</strong>
            </p>
          </div>
        )}

        <ResponsiveContainer height={120}>
          <ComposedChart
            syncId={syncId}
            data={chartData}
            onMouseMove={handleChartMouseMove}
            onMouseLeave={handleChartMouseLeave}
          >
            <YAxis width={40} fontSize={12} tickFormatter={formatTick} />

            <XAxis
              dataKey="day"
              fontSize={12}
              tickFormatter={formatXAxisTick}
            />

            <Tooltip content={EmptyTooltip} />

            <Bar
              dataKey="dailyAmountUSD"
              name="Daily Amount"
              fill="var(--chart-3)"
              stroke="#000"
              strokeWidth={1}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function EmptyTooltip() {
  return null;
}
