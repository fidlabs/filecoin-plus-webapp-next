"use client";

import { ChartStat } from "@/components/chart-stat";
import { ChartTooltip } from "@/components/chart-tooltip";
import { OverlayLoader } from "@/components/overlay-loader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QueryKey, StorageProvidersPageSectionId } from "@/lib/constants";
import { useDelayedFlag } from "@/lib/hooks/use-delayed-flag";
import { bigintToPercentage, cn, objectToURLSearchParams } from "@/lib/utils";
import { weekFromDate, weekToReadableString, weekToString } from "@/lib/weeks";
import { scaleSymlog } from "d3-scale";
import { filesize } from "filesize";
import { CheckIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type ComponentProps,
  type MouseEventHandler,
  useCallback,
  useMemo,
  useState,
} from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CategoricalChartFunc } from "recharts/types/chart/generateCategoricalChart";
import useSWR from "swr";
import {
  fetchStorageProvidersComplianceData,
  FetchStorageProvidersComplianceDataParameters,
} from "../storage-providers-data";

type CardProps = ComponentProps<typeof Card>;
export interface StorageProvidersComplianceWidgetProps
  extends Omit<CardProps, "children"> {
  animationDuration?: number;
}

interface ChartDataEntry {
  date: string;
  compliant: number;
  partiallyCompliant: number;
  nonCompliant: number;
}

interface Stat {
  value: string;
  percentageChange: number;
  label: string;
}

const scales = ["linear", "percentage", "log"] as const;
const modes = ["datacap", "count"] as const;

const scalesLabelDict: Record<(typeof scales)[number], string> = {
  linear: "Linear",
  percentage: "Percentage",
  log: "Log",
};

const modesLabelDict: Record<(typeof modes)[number], string> = {
  datacap: "PiB",
  count: "Count",
};

const colors = {
  compliant: "#66a61e",
  partiallyCompliant: "orange",
  nonCompliant: "#ff0029",
} as const;

export function StorageProvidersComplianceWidget({
  animationDuration = 500,
  className,
  ...rest
}: StorageProvidersComplianceWidgetProps) {
  const [editionId, setEditionId] = useState<string>();
  const [retrievabilityMetricToggled, setRetrievabilityMetricToggled] =
    useState(true);
  const [numberOfClientsMetricToggled, setNumberOfClientsMetricToggled] =
    useState(true);
  const [totalDealSizeMetricToggled, setTotalDealSizeMetricToggled] =
    useState(true);
  const [scale, setScale] = useState<string>(scales[0]);
  const [mode, setMode] = useState<string>(modes[0]);
  const { push: navigate } = useRouter();

  const parameters: FetchStorageProvidersComplianceDataParameters = {
    editionId,
    retrievability: retrievabilityMetricToggled,
    numberOfClients: numberOfClientsMetricToggled,
    totalDealSize: totalDealSizeMetricToggled,
  };

  const { data, isLoading } = useSWR(
    [QueryKey.STORAGE_PROVIDERS_COMPLIANCE_DATA, parameters],
    ([, fetchParameters]) =>
      fetchStorageProvidersComplianceData(fetchParameters),
    {
      keepPreviousData: true,
    }
  );
  const isLongLoading = useDelayedFlag(isLoading, 500);

  const stats = useMemo<Stat[]>(() => {
    const [previousIntervalData, currentIntervalData] =
      data?.results.slice(-2) ?? [];
    const [
      [previousCompliantDatacap, previousCompliantSPCount],
      [currentCompliantDatacap, currentCompliantSPCount],
    ] = [previousIntervalData, currentIntervalData].map((entry) => {
      if (!entry) {
        return [0n, 0n];
      }

      return [
        BigInt(entry.compliantSpsTotalDatacap),
        BigInt(entry.compliantSps),
      ];
    });

    return [
      {
        value: filesize(currentCompliantDatacap, { standard: "iec" }),
        label: "Compliant DC",
        percentageChange:
          bigintToPercentage(
            currentCompliantDatacap,
            previousCompliantDatacap,
            2
          ) - 100,
      },
      {
        value: currentCompliantSPCount.toString(),
        label: "Compliant SPs",
        percentageChange:
          bigintToPercentage(
            currentCompliantSPCount,
            previousCompliantSPCount,
            2
          ) - 100,
      },
    ];
  }, [data]);

  const chartData = useMemo<ChartDataEntry[]>(() => {
    if (!data) {
      return [];
    }

    return data.results.map<ChartDataEntry>((result) => {
      const [compliant, partiallyCompliant, nonCompliant] =
        mode === "datacap"
          ? [
              result.compliantSpsTotalDatacap,
              result.partiallyCompliantSpsTotalDatacap,
              result.nonCompliantSpsTotalDatacap,
            ].map(BigInt)
          : [
              result.compliantSps,
              result.partiallyCompliantSps,
              result.nonCompliantSps,
            ].map(BigInt);

      if (scale === "percentage") {
        const total = compliant + partiallyCompliant + nonCompliant;

        return {
          date: result.week,
          compliant: bigintToPercentage(compliant, total, 6),
          partiallyCompliant: bigintToPercentage(partiallyCompliant, total, 6),
          nonCompliant: bigintToPercentage(nonCompliant, total, 6),
        };
      }

      return {
        date: result.week,
        compliant: Number(compliant),
        partiallyCompliant: Number(partiallyCompliant),
        nonCompliant: Number(nonCompliant),
      };
    });
  }, [data, mode, scale]);

  const formatDate = useCallback((value: unknown) => {
    if (typeof value !== "string") {
      return String(value);
    }

    return weekToReadableString(weekFromDate(value));
  }, []);

  const formatValue = useCallback(
    (value: string | number) => {
      if (scale === "percentage") {
        return (
          parseFloat(
            typeof value === "string" ? value : value.toFixed(2)
          ).toString() + "%"
        );
      }

      if (mode === "datacap") {
        return filesize(value, { standard: "iec" });
      }

      return String(value);
    },
    [mode, scale]
  );

  const handleEditionChange = useCallback((value: string) => {
    setEditionId(value === "all" ? undefined : value);
  }, []);

  const handleChartClick = useCallback<CategoricalChartFunc>(
    (state) => {
      if (typeof state.activeLabel !== "string") {
        return;
      }

      const week = weekFromDate(state.activeLabel);
      const weekString = week ? weekToString(week) : "latest";

      const searchParams = objectToURLSearchParams(
        {
          complianceScore: "compliant",
          retrievability: retrievabilityMetricToggled,
          numberOfClients: numberOfClientsMetricToggled,
          totalDealSize: totalDealSizeMetricToggled,
        },
        true
      );

      searchParams.set("complianceScore", "compliant");
      searchParams.set("retrievability", String(retrievabilityMetricToggled));
      searchParams.set("numberOfClients", String(numberOfClientsMetricToggled));
      searchParams.set("totalDealSize", String(totalDealSizeMetricToggled));

      navigate(
        `/storage-providers/compliance/${weekString}?${searchParams.toString()}`
      );
    },
    [
      navigate,
      numberOfClientsMetricToggled,
      retrievabilityMetricToggled,
      totalDealSizeMetricToggled,
    ]
  );

  return (
    <Card {...rest} className={cn("pb-6", className)}>
      <header className="px-4 py-4">
        <h3 className="text-md font-medium">Compliance</h3>
        <p className="text-xs text-muted-foreground">
          Select metrics below to see Storage Providers compliance
        </p>
      </header>

      <div className="px-4 pb-4 mb-4 flex flex-wrap gap-2 border-b">
        <ComplianceMetricTile
          label="Retrievability score above average"
          active={retrievabilityMetricToggled}
          action={{
            label: "Retrievability",
            url: `/storage-providers#${StorageProvidersPageSectionId.RETRIEVABILITY}`,
          }}
          onToggle={setRetrievabilityMetricToggled}
        />

        <ComplianceMetricTile
          label="At least 3 clients"
          active={numberOfClientsMetricToggled}
          action={{
            label: "Client Diversity",
            url: `/storage-providers#${StorageProvidersPageSectionId.CLIENT_DIVERSITY}`,
          }}
          onToggle={setNumberOfClientsMetricToggled}
        />

        <ComplianceMetricTile
          label="At most 30% DC from a single client"
          active={totalDealSizeMetricToggled}
          action={{
            label: "Biggest Allocation",
            url: `/storage-providers#${StorageProvidersPageSectionId.CLIENT_DISTRIBUTION}`,
          }}
          onToggle={setTotalDealSizeMetricToggled}
        />
      </div>

      <div className="px-4 mb-8 flex flex-wrap gap-y-4 justify-between items-start">
        <div className="flex flex-wrap gap-x-8">
          {stats.map((stat, index) => {
            return (
              <ChartStat
                key={`stat_${index}`}
                label={stat.label}
                value={stat.value}
                percentageChange={stat.percentageChange / 100}
                placeholderWidth={160}
              />
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={editionId ?? "all"}
            onValueChange={handleEditionChange}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="All Editions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Editions</SelectItem>
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
        </div>
      </div>

      <div className="px-4 mb-2">
        <p className="text-xs text-muted-foreground text-center">
          Hover and click on the chart to see a list of Storage Providers
          matching selected criteria for that week.
        </p>
      </div>

      <div className="relative">
        <ResponsiveContainer width="100%" height={400} debounce={500}>
          <AreaChart
            data={chartData}
            margin={{
              left: 24,
              right: 16,
              bottom: 32,
              top: 32,
            }}
            onClick={handleChartClick}
          >
            <XAxis
              dataKey="date"
              fontSize={12}
              tickFormatter={formatDate}
              angle={90}
              tickMargin={24}
            />
            <YAxis
              fontSize={14}
              tickFormatter={formatValue}
              scale={scale === "log" ? scaleSymlog().constant(1) : "linear"}
            />
            <Area
              className="cursor-pointer"
              type="monotone"
              stackId="values"
              dataKey="compliant"
              name="Compliant"
              animationDuration={animationDuration}
              stroke={colors.compliant}
              fill={colors.compliant}
            />
            <Area
              type="monotone"
              stackId="values"
              dataKey="partiallyCompliant"
              name="Partially Compliant"
              animationDuration={animationDuration}
              stroke={colors.partiallyCompliant}
              fill={colors.partiallyCompliant}
            />
            <Area
              type="monotone"
              stackId="values"
              dataKey="nonCompliant"
              name="Non Compliant"
              animationDuration={animationDuration}
              stroke={colors.nonCompliant}
              fill={colors.nonCompliant}
            />
            <Tooltip<string | number, string>
              formatter={formatValue}
              labelFormatter={formatDate}
              content={ChartTooltip}
            />
          </AreaChart>
        </ResponsiveContainer>
        {<OverlayLoader show={!data || isLongLoading} />}
      </div>
    </Card>
  );
}

interface ComplianceMetricTileProps {
  action: {
    label: string;
    url: string;
  };
  active: boolean;
  label: string;
  onToggle(nextState: boolean): void;
}

function ComplianceMetricTile({
  action,
  active,
  label,
  onToggle,
}: ComplianceMetricTileProps) {
  const handleClick = useCallback(() => {
    onToggle(!active);
  }, [active, onToggle]);

  const handleActionClick = useCallback<MouseEventHandler>((event) => {
    event.stopPropagation();
  }, []);

  return (
    <div
      className={cn(
        "cursor-pointer flex items-center gap-x-4 border rounded-full pl-3 pr-6 py-1 bg-black/5 border-black/20 text-muted-foreground",
        active && "bg-dodger-blue/10 border-dodger-blue/50"
      )}
      onClick={handleClick}
    >
      <CheckIcon className={cn(!active && "text-gray-300")} />
      <div>
        <p className={cn("text-sm font-medium", !active && "text-gray-400")}>
          {label}
        </p>
        <Button
          asChild
          className={cn("text-xs", !active && "text-gray-400")}
          variant="link"
          onClick={handleActionClick}
        >
          <Link href={action.url}>{action.label}</Link>
        </Button>
      </div>
    </div>
  );
}
