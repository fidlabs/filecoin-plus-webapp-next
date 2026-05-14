import { isValidDate } from "@/lib/utils";
import { weekFromDate, weekToReadableString } from "@/lib/weeks";
import { UTCDate } from "@date-fns/utc";
import { isSameMonth } from "date-fns";
import { useCallback, useState, type ReactNode } from "react";
import {
  Area,
  Bar,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { type CategoricalChartFunc } from "recharts/types/chart/types";

type DataEntry<
  DateKey extends string,
  CumulativeKey extends string,
  VolumeKey extends string,
> = {
  [D in DateKey]: string;
} & { [C in CumulativeKey]: number } & { [V in VolumeKey]: number };

type WindowSize = "day" | "week" | "month";
type DateFormatFn = (date: string, windowSize: WindowSize) => string;
type ValueFormatFn = (value: number) => string;
type XAxisTickFormatFn = (
  value: string,
  index: number,
  values: string[],
  windowSize: WindowSize
) => string;
type YAxisTickFormatFn = (
  value: number,
  index: number,
  windowSize: WindowSize
) => string;

export interface CumulativeChartWithVolumeProps<
  DateKey extends string,
  CumulativeKey extends string,
  VolumeKey extends string,
> {
  cumulativeKey: CumulativeKey;
  cumlativeLabel?: ReactNode;
  data: Array<DataEntry<DateKey, CumulativeKey, VolumeKey>>;
  dateKey: DateKey;
  syncId: string;
  volumeKey: VolumeKey;
  volumeLabel?: ReactNode;
  windowSize: WindowSize;
  formatDate?: DateFormatFn;
  formatValue?: ValueFormatFn;
  formatXAxisTick?: XAxisTickFormatFn;
  formatYAxisTick?: YAxisTickFormatFn;
}

const defaultFormatDate: DateFormatFn = (dateString, windowSize) => {
  const date = new UTCDate(dateString);

  if (!isValidDate(date)) {
    return dateString;
  }

  switch (windowSize) {
    case "day":
      return new Intl.DateTimeFormat("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      }).format(date);
    case "week":
      return weekToReadableString(weekFromDate(date));
    case "month":
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      }).format(date);
  }
};

const defaultFormatXAxisTick: XAxisTickFormatFn = (
  dateString,
  index,
  values,
  windowSize
) => {
  const date = new UTCDate(dateString);

  if (!isValidDate(date)) {
    return dateString;
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

  const previousDateString = index > 0 ? values.at(index - 1) : undefined;
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
};

const defaultFormatYAxisick: YAxisTickFormatFn = (value) => {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
    notation: "compact",
  }).format(value);
};

export function CumulativeChartWithVolume<
  DateKey extends string,
  CumulativeKey extends string,
  VolumeKey extends string,
>({
  cumulativeKey,
  cumlativeLabel = "Cumulative Total",
  data,
  dateKey,
  syncId,
  volumeKey,
  volumeLabel = "Volume",
  windowSize,
  formatDate = defaultFormatDate,
  formatValue = String,
  formatXAxisTick = defaultFormatXAxisTick,
  formatYAxisTick = defaultFormatYAxisick,
}: CumulativeChartWithVolumeProps<DateKey, CumulativeKey, VolumeKey>) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const activeIndex = hoverIndex === null ? data.length - 1 : hoverIndex;
  const activeElement = data.at(activeIndex);
  const xAxisValues = data.map((i) => i[dateKey]);

  const xAxisTickFormatter = useCallback(
    (value: string, index: number) => {
      return formatXAxisTick(value, index, xAxisValues, windowSize);
    },
    [formatXAxisTick, xAxisValues, windowSize]
  );

  const yAxisTickFormatter = useCallback(
    (value: number, index: number) => {
      return formatYAxisTick(value, index, windowSize);
    },
    [formatYAxisTick, windowSize]
  );

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
    <div>
      {!!activeElement && (
        <div className="px-4 mb-2">
          <p className="text-sm">
            {cumlativeLabel} @ {formatDate(activeElement[dateKey], windowSize)}
            {": "}
            <strong>{formatValue(activeElement[cumulativeKey])}</strong>
          </p>
        </div>
      )}
      <ResponsiveContainer width="100%" height={230} debounce={50}>
        <ComposedChart
          syncId={syncId}
          data={data}
          maxBarSize={24}
          onMouseMove={handleChartMouseMove}
          onMouseLeave={handleChartMouseLeave}
          margin={{
            top: 12,
          }}
        >
          <XAxis dataKey={dateKey} fontSize={12} hide />
          <YAxis width={50} fontSize={12} tickFormatter={yAxisTickFormatter} />
          <Tooltip content={EmptyTooltip} />

          <Area
            dataKey={cumulativeKey}
            fill="hsl(var(--color-dodger-blue))"
            stroke="hsl(var(--color-dodger-blue))"
          />

          <Bar dataKey={cumulativeKey} hide />
        </ComposedChart>
      </ResponsiveContainer>

      {!!activeElement && (
        <div className="px-4 my-2">
          <p className="text-sm">
            {volumeLabel} @ {formatDate(activeElement[dateKey], windowSize)}
            {": "}
            <strong>{formatValue(activeElement[volumeKey])}</strong>
          </p>
        </div>
      )}

      <ResponsiveContainer height={120}>
        <ComposedChart
          syncId={syncId}
          data={data}
          onMouseMove={handleChartMouseMove}
          onMouseLeave={handleChartMouseLeave}
        >
          <YAxis width={50} fontSize={12} tickFormatter={yAxisTickFormatter} />

          <XAxis
            dataKey={dateKey}
            fontSize={12}
            tickFormatter={xAxisTickFormatter}
          />

          <Tooltip content={EmptyTooltip} />

          <Bar dataKey={volumeKey} fill="hsl(var(--color-dodger-blue))" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

function EmptyTooltip() {
  return null;
}
