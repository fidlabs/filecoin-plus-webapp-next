import {
  AllocatorsPageSectionId,
  ClientsPageSectionId,
  DashboardPageSectionId,
  StorageProvidersPageSectionId,
} from "@/lib/constants";
import { useSingleClickHandler } from "@/lib/hooks/use-single-click-handler";
import {
  AllocatorsDashboardStatisticType,
  ClientsDashboardStatisticType,
  StorageProvidersDashboardStatisticType,
  type AllocatorsDashboardStatistic,
  type ClientsDashboardStatistic,
  type DashboardStatistic,
  type DashboardStatisticDurationValue,
  type StorageProvidersDashboardStatistic,
} from "@/lib/schemas";
import { cn } from "@/lib/utils";
import { formatDuration, intervalToDuration } from "date-fns";
import { filesize } from "filesize";
import { ChevronRightIcon, InfoIcon } from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo, useState, type ReactNode } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Drawer, DrawerContent, DrawerTrigger } from "./ui/drawer";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";
import { Skeleton } from "./ui/skeleton";

type AnyDashboardStatistic =
  | AllocatorsDashboardStatistic
  | ClientsDashboardStatistic
  | StorageProvidersDashboardStatistic;

interface Link {
  label: ReactNode;
  url: string;
}

export interface DashboardStatisticDisplayProps {
  dashboardStatistic: AnyDashboardStatistic;
  showLoading?: boolean;
}

const bytesStatisticTypes: string[] = ["DATACAP_SPENT_BY_CLIENTS"];
const numericFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});
const percentageFormatter = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 2,
});
const percentageChangeFormatter = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 2,
  signDisplay: "always",
});

function durationStatisticToMilliseconds(
  statistic: DashboardStatisticDurationValue
): number {
  const { unit, value } = statistic;

  switch (unit) {
    case "millisecond":
      return value;
    case "second":
      return value * 1000;
    case "minute":
      return value * 1000 * 60;
    case "hour":
      return value * 1000 * 60 * 60;
    case "day":
      return value * 1000 * 60 * 60 * 24;
    case "week":
      return value * 1000 * 60 * 60 * 24 * 7;
    case "month":
      return value * 1000 * 60 * 60 * 24 * 30;
    case "year":
      return value * 1000 * 60 * 60 * 24 * 365;
  }
}

function formatDashboardStatisticValue(
  dashboardStatistic: AnyDashboardStatistic
): ReactNode | [ReactNode, ReactNode] {
  if (bytesStatisticTypes.includes(dashboardStatistic.type)) {
    return filesize(dashboardStatistic.value.value, { standard: "iec" });
  }

  if (dashboardStatistic.value.type === "duration") {
    const { unit, value } = dashboardStatistic.value;

    const rawValueText = `${value} ${unit}${value === 1 ? "" : "s"}`;

    if (!value) {
      return ["N/A", rawValueText];
    }

    const readableText = formatDuration(
      intervalToDuration({
        start: 0,
        end: durationStatisticToMilliseconds(dashboardStatistic.value),
      }),
      { format: ["days", "hours"] }
    );

    return [readableText, rawValueText];
  }

  if (dashboardStatistic.value.type === "percentage") {
    return percentageFormatter.format(dashboardStatistic.value.value);
  }

  if (dashboardStatistic.value.type === "numeric") {
    return numericFormatter.format(dashboardStatistic.value.value);
  }

  return String(dashboardStatistic.value.value);
}

function getStatisticLinkTuple(
  statistic: AnyDashboardStatistic
): [ReactNode, string] | null {
  switch (statistic.type) {
    case AllocatorsDashboardStatisticType.TOTAL_APPROVED_ALLOCATORS:
      return [
        "Allocators List",
        `/allocators#${AllocatorsPageSectionId.ALLOCATORS_LIST}`,
      ];
    case AllocatorsDashboardStatisticType.TOTAL_ACTIVE_ALLOCATORS:
    case ClientsDashboardStatisticType.DATACAP_SPENT_BY_CLIENTS:
      return [
        "DC Allocations",
        `/#${DashboardPageSectionId.DATACAP_ALLOCATIONS_OVER_TIME}`,
      ];
    case AllocatorsDashboardStatisticType.COMPLIANT_ALLOCATORS:
      return [
        "Leaderboard",
        `/allocators#${AllocatorsPageSectionId.LEADERBOARDS}`,
      ];
    case AllocatorsDashboardStatisticType.NON_COMPLIANT_ALLOCATORS:
      return [
        "Allocators Compliance",
        `/allocators#${AllocatorsPageSectionId.COMPLIANCE}`,
      ];
    case AllocatorsDashboardStatisticType.NUMBER_OF_ALERTS:
      return ["Alerts Dashboard", "/alerts"];
    case ClientsDashboardStatisticType.TOTAL_CLIENTS:
      return ["Clients List", `/clients#${ClientsPageSectionId.LIST}`];
    case StorageProvidersDashboardStatisticType.TOTAL_STORAGE_PROVIDERS:
      return [
        "Providers List",
        `/storage-providers#${StorageProvidersPageSectionId.LIST}`,
      ];
    case StorageProvidersDashboardStatisticType.STORAGE_PROVIDERS_WITH_HIGH_RPA_PERCENTAGE:
    case StorageProvidersDashboardStatisticType.AVERAGE_URL_FINDER_RETRIEVABILITY_PERCENTAGE:
      return [
        "Retrievability",
        `/storage-providers#${StorageProvidersPageSectionId.RETRIEVABILITY}`,
      ];
    case StorageProvidersDashboardStatisticType.STORAGE_PROVIDERS_REPORTING_TO_IPNI_PERCENTAGE:
      return [
        "IPNI Breakdown",
        `/storage-providers#${StorageProvidersPageSectionId.IPNI_MISREPORTING}`,
      ];
    default:
      return null;
  }
}

export function DashboardStatisticDisplay({
  dashboardStatistic,
  showLoading = false,
}: DashboardStatisticDisplayProps) {
  const [showRawValue, setShowRawValue] = useState(false);
  const value = useMemo(() => {
    return formatDashboardStatisticValue(dashboardStatistic);
  }, [dashboardStatistic]);
  const link = useMemo<Link | null>(() => {
    const linkTuple = getStatisticLinkTuple(dashboardStatistic);

    if (!linkTuple) {
      return null;
    }

    const [label, url] = linkTuple;

    return {
      label,
      url,
    };
  }, [dashboardStatistic]);
  const helpTrigger = <InfoIcon className="w-4 h-4 text-muted-foreground" />;

  const toggleValueDisplay = useCallback(() => {
    setShowRawValue((currentValue) => !currentValue);
  }, []);

  const handleValueClick = useSingleClickHandler({
    onSingleClick: toggleValueDisplay,
  });

  return (
    <Card className="flex flex-col justify-center h-[112px]">
      <CardHeader className="pt-0 pb-2">
        <CardTitle className="truncate">{dashboardStatistic.title}</CardTitle>

        {dashboardStatistic.description !== null && (
          <>
            <Drawer autoFocus>
              <DrawerTrigger className="md:hidden">{helpTrigger}</DrawerTrigger>
              <DrawerContent className="p-4 text-center">
                <h5 className="text-md font-semibold my-2">
                  {dashboardStatistic.title}
                </h5>
                <p className="text-sm mb-4">{dashboardStatistic.description}</p>
                <DrawerTrigger asChild>
                  <Button variant="outline">Got It</Button>
                </DrawerTrigger>
              </DrawerContent>
            </Drawer>
            <HoverCard>
              <HoverCardTrigger className="hidden md:block">
                {helpTrigger}
              </HoverCardTrigger>
              <HoverCardContent>
                <p className="text-xs">{dashboardStatistic.description}</p>
              </HoverCardContent>
            </HoverCard>
          </>
        )}
      </CardHeader>
      <CardContent className="py-0">
        <p className="text-lg font-semibold truncate">
          {!showLoading && (
            <>
              {Array.isArray(value) ? (
                <span className="cursor-pointer" onClick={handleValueClick}>
                  <span className={cn(showRawValue && "hidden")}>
                    {value[0]}
                  </span>
                  <span className={cn(!showRawValue && "hidden")}>
                    {value[1]}
                  </span>
                </span>
              ) : (
                value
              )}
            </>
          )}

          {dashboardStatistic.percentageChange !== null && !showLoading && (
            <ChangeText
              percentageChange={dashboardStatistic.percentageChange}
            />
          )}
          {showLoading && <Skeleton className="h-7 w-[100px]" />}
        </p>

        {!!link && (
          <Button className="mt-1 text-xs" asChild variant="link">
            <Link href={link.url}>
              {link.label} <ChevronRightIcon className="h-3 w-3 ml-0.5" />
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function ChangeText({
  percentageChange,
}: {
  percentageChange: NonNullable<DashboardStatistic["percentageChange"]>;
}) {
  const positiveIncrease =
    !percentageChange.increaseNegative && percentageChange.value > 0;
  const positiveDecrease =
    percentageChange.increaseNegative && percentageChange.value < 0;
  const negativeIncrease =
    !percentageChange.increaseNegative && percentageChange.value < 0;
  const negativeDecrease =
    percentageChange.increaseNegative && percentageChange.value > 0;

  return (
    <span
      className={cn(
        "font-light text-muted-foreground",
        (positiveIncrease || positiveDecrease) && "text-green-500",
        (negativeIncrease || negativeDecrease) && "text-red-500"
      )}
    >
      {" "}
      ({percentageChangeFormatter.format(percentageChange.value)})
    </span>
  );
}
