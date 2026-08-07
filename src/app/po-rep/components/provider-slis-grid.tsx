import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { HTMLAttributes, useMemo } from "react";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { FetchPoRepProvidersReturnType } from "../po-rep-data";

type DivProps = Omit<HTMLAttributes<HTMLDivElement>, "children">;
type SLIs = FetchPoRepProvidersReturnType["data"][number]["slis"];
type SLI = SLIs[number];
type SLIType = SLI["type"];

export interface ProviderSLIsGridProps extends DivProps {
  providerId: string;
  slis: SLIs;
}

interface SLIProps {
  providerId: string;
  sli: SLI;
}

interface ChangeChartProps {
  data: SLI["measuredValues"];
  providerId: string;
  sliType: SLI["type"];
  variant: "positive" | "negative";
}

interface FormatSLIValueParameters {
  sliType: SLIType;
  value: number;
  omitUnit?: boolean;
}

const sliLabelDict: Record<SLIType, string> = {
  bandwidthMbps: "Bandwidth",
  indexingPct: "Indexing",
  latencyMs: "Latency (TTFB)",
  retrievabilityBps: "Retrievability",
};

const colors = {
  positive: "#66a61e",
  negative: "#ff0029",
} as const;

const numberFormatter = new Intl.NumberFormat("en-US");
const percentageFormatter = new Intl.NumberFormat("en-US", {
  style: "percent",
});
const changeFormatter = new Intl.NumberFormat("en-US", {
  style: "percent",
  signDisplay: "always",
  maximumFractionDigits: 2,
});
const millisecondsFormatter = new Intl.NumberFormat("en-US", {
  style: "unit",
  unit: "millisecond",
});
const dateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function ProviderSLIsGrid({
  className,
  providerId,
  slis,
}: ProviderSLIsGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4",
        className
      )}
    >
      {slis.map((sli) => (
        <SLI key={sli.type} sli={sli} providerId={providerId} />
      ))}
    </div>
  );
}

function SLI({ providerId, sli }: SLIProps) {
  const measuredValue = sli.measuredValues.at(0);
  const previousValue = sli.measuredValues.at(1);
  const showWarning =
    !measuredValue ||
    (sli.type === "latencyMs"
      ? measuredValue.value > sli.declaredValue
      : measuredValue.value < sli.declaredValue);

  const change = useMemo(() => {
    if (!measuredValue || !previousValue) {
      return null;
    }

    return previousValue.value === 0
      ? null
      : measuredValue.value / previousValue.value - 1;
  }, [measuredValue, previousValue]);

  const hasImproved =
    change !== null && (sli.type === "latencyMs" ? change < 0 : change > 0);

  return (
    <div>
      <p className="text-sm mb-1 font-semibold">{sliLabelDict[sli.type]}</p>

      <div className="flex items-center gap-3">
        <div className="flex gap-3">
          <div>
            <p className={cn(showWarning && "text-yellow-600")}>
              {measuredValue
                ? formatSLIValue({
                    sliType: sli.type,
                    value: measuredValue.value,
                    omitUnit: true,
                  })
                : "N/A"}
            </p>
            <span className="text-xs text-muted-foreground block -mt-0.5">
              Measured
            </span>
          </div>
          <span>/</span>
          <div>
            <p>
              {formatSLIValue({ sliType: sli.type, value: sli.declaredValue })}
            </p>
            <span className="text-xs text-muted-foreground block -mt-0.5">
              Declared
            </span>
          </div>
        </div>

        {!!previousValue && (
          <>
            <ChangeChart
              data={sli.measuredValues.toReversed()}
              providerId={providerId}
              sliType={sli.type}
              variant={
                hasImproved || change === null || change === 0
                  ? "positive"
                  : "negative"
              }
            />
            {change !== null && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p
                      className={cn(
                        "text-sm text-muted-foreground",
                        change !== 0 && hasImproved && "text-green-600",
                        change !== 0 && !hasImproved && "text-red-500"
                      )}
                    >
                      {changeFormatter.format(change)}
                    </p>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Compared to previous measurement at{" "}
                      {dateFormatter.format(new Date(previousValue.date))}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ChangeChart({ data, providerId, sliType, variant }: ChangeChartProps) {
  const gradientId = `${providerId}_${sliType}_${variant}_fillColor`;

  return (
    <ResponsiveContainer height={30} width={50}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={colors[variant]} stopOpacity={0.8} />
            <stop offset="95%" stopColor={colors[variant]} stopOpacity={0} />
          </linearGradient>
        </defs>
        <YAxis hide={true} />
        <XAxis hide={true} dataKey="date" />
        <Area
          animationDuration={150}
          activeDot={false}
          fillOpacity={1}
          fill={`url(#${gradientId})`}
          dataKey="value"
          stroke={colors[variant]}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function formatSLIValue({
  sliType,
  value,
  omitUnit = false,
}: FormatSLIValueParameters): string {
  switch (sliType) {
    case "bandwidthMbps":
      return numberFormatter.format(value) + (omitUnit ? "" : " Mbps");
    case "indexingPct":
      return percentageFormatter.format(value / 100);
    case "latencyMs":
      return omitUnit
        ? numberFormatter.format(value)
        : millisecondsFormatter.format(value);
    case "retrievabilityBps":
      return percentageFormatter.format(value / 10000);
  }
}
