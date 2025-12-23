import {
  type AllocatorsDashboardStatistic,
  type ClientsDashboardStatistic,
  type StorageProvidersDashboardStatistic,
} from "@/lib/schemas";
import { cn } from "@/lib/utils";
import { filesize } from "filesize";
import { InfoIcon } from "lucide-react";
import { useMemo, type ReactNode } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Drawer, DrawerContent, DrawerTrigger } from "./ui/drawer";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";
import { Skeleton } from "./ui/skeleton";

type AnyDashboardStatistic =
  | AllocatorsDashboardStatistic
  | ClientsDashboardStatistic
  | StorageProvidersDashboardStatistic;

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

function formatDashboardStatisticValue(
  dashboardStatistic: AnyDashboardStatistic
): ReactNode {
  if (bytesStatisticTypes.includes(dashboardStatistic.type)) {
    return filesize(dashboardStatistic.value.value, { standard: "iec" });
  }

  if (dashboardStatistic.value.type === "percentage") {
    return percentageFormatter.format(dashboardStatistic.value.value);
  }

  if (dashboardStatistic.value.type === "numeric") {
    return numericFormatter.format(dashboardStatistic.value.value);
  }

  return String(dashboardStatistic.value.value);
}

export function DashboardStatisticDisplay({
  dashboardStatistic,
  showLoading = false,
}: DashboardStatisticDisplayProps) {
  const value = useMemo(() => {
    return formatDashboardStatisticValue(dashboardStatistic);
  }, [dashboardStatistic]);

  const helpTrigger = <InfoIcon className="w-4 h-4 text-muted-foreground" />;

  return (
    <Card>
      <CardHeader className="pb-2">
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
      <CardContent>
        <p className="text-lg font-semibold truncate">
          {!showLoading && value}
          {dashboardStatistic.percentageChange !== null && !showLoading && (
            <span
              className={cn(
                "font-light text-muted-foreground",
                dashboardStatistic.percentageChange.value > 0 &&
                  "text-green-500",
                dashboardStatistic.percentageChange.value < 0 && "text-red-500"
              )}
            >
              {" "}
              (
              {percentageChangeFormatter.format(
                dashboardStatistic.percentageChange.value
              )}
              )
            </span>
          )}
          {showLoading && <Skeleton className="h-7 w-[100px]" />}
        </p>
      </CardContent>
    </Card>
  );
}
