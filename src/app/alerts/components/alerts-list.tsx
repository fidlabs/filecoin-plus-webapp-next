"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AllocatorsDailyReportChecksResponse } from "@/lib/api";
import { useSearchParamsFilters } from "@/lib/hooks/use-search-params-filters";
import { cn } from "@/lib/utils";
import { UTCDate } from "@date-fns/utc";
import { AlertTriangleIcon } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef } from "react";

export interface AlertsListProps {
  data: AllocatorsDailyReportChecksResponse;
}

type Result = AllocatorsDailyReportChecksResponse["results"][number];

const oneDayInMs = 1000 * 60 * 60 * 24;
const oneWeekInMs = oneDayInMs * 7;

function getFailedCheckDiffInDays(
  comparedDate: Date,
  failedCheck: Result["failedChecks"][number]
): number {
  const comparedValue = comparedDate.valueOf();
  const lastUpdateValue = new UTCDate(
    failedCheck.lastPassed ?? failedCheck.firstSeen
  ).valueOf();
  const diffInMs = Math.max(0, comparedValue - lastUpdateValue);
  return Math.floor(diffInMs / oneDayInMs);
}

function getFreshnessScore(
  comparedDate: Date | string | number,
  failedChecks: Result["failedChecks"]
): number {
  const comparedValue = new UTCDate(comparedDate).valueOf();

  const scores = failedChecks.map((check) => {
    const lastUpdateValue = new UTCDate(
      check.lastPassed ?? check.firstSeen
    ).valueOf();
    const diff = comparedValue - lastUpdateValue.valueOf();
    return oneWeekInMs - diff;
  });

  return Math.max(...scores);
}

export function AlertsList({ data }: AlertsListProps) {
  const { filters, updateFilter } = useSearchParamsFilters();
  const containerRef = useRef<HTMLDivElement | null>(null);

  const visibleResults = useMemo(() => {
    return data.results
      .filter((result) => result.checksFailedCount > 0)
      .toSorted((a, b) => {
        return (
          getFreshnessScore(data.day, b.failedChecks) -
          getFreshnessScore(data.day, a.failedChecks)
        );
      });
  }, [data]);

  const [alertsListDateUTC, archive] = useMemo(() => {
    const now = new UTCDate();
    const date = new UTCDate(data.day);
    const diffInMs = now.valueOf() - date.valueOf();

    return [date, Math.floor(diffInMs / oneDayInMs) > 0];
  }, [data.day]);

  const dayString = new UTCDate(data.day).toLocaleString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const resetDateFilter = useCallback(() => {
    updateFilter("date", undefined);
  }, [updateFilter]);

  useEffect(() => {
    if (filters.date && containerRef.current) {
      containerRef.current.scrollIntoView({
        behavior: "smooth",
      });
    }
  }, [filters.date]);

  return (
    <div className="pb-8" ref={containerRef}>
      <div className="mb-8">
        <h2 className="text-lg mb-1 font-semibold">
          Alerts List per Allocator
        </h2>
        <p className="text-sm text-muted-foreground">
          {visibleResults.length} allocator{visibleResults.length !== 1 && "s"}{" "}
          with failed checks on {dayString}
        </p>
      </div>

      {archive && (
        <div className="bg-yellow-500/30 border border-yellow-500 rounded-lg text-yellow-700 flex items-center gap-2 p-3 mb-6">
          <AlertTriangleIcon className="h-4 w-4" />
          <p className="text-sm">
            You are viewing an archived list of alerts, which shows the state as
            of {dayString}, and may not reflect the current state of the
            ecosystem.{" "}
            <Button variant="link" onClick={resetDateFilter}>
              Show recent alerts.
            </Button>
          </p>
        </div>
      )}

      {visibleResults.length === 0 && (
        <div className="p-6">
          <p className="text-center text-muted-foreground">Nothing to show</p>
        </div>
      )}

      {visibleResults.length > 0 && (
        <div className="flex flex-col gap-6">
          {visibleResults.map((result) => {
            const reportId: string | undefined =
              result.failedChecks[0]?.reportId;

            return (
              <Card key={result.allocatorId}>
                <CardHeader>
                  <div>
                    <CardTitle>
                      <Button
                        variant="link"
                        asChild
                        className="text-inherit text-base"
                      >
                        <Link href={`/allocators/${result.allocatorId}`}>
                          {result.allocatorName ?? result.allocatorId}
                        </Link>
                      </Button>
                    </CardTitle>

                    <CardDescription>
                      <Button variant="link" asChild>
                        <Link href={`/allocators/${result.allocatorId}`}>
                          {result.allocatorId}
                        </Link>
                      </Button>
                    </CardDescription>
                  </div>

                  <CardDescription>
                    Failed {result.checksFailedCount} /{" "}
                    {result.checksFailedCount + result.checksPassedCount} checks
                  </CardDescription>
                </CardHeader>

                <ul className="border-y mb-2">
                  {result.failedChecks.map((check, index) => {
                    const diffInDays = getFailedCheckDiffInDays(
                      alertsListDateUTC,
                      check
                    );

                    return (
                      <li
                        key={index}
                        className="px-6 py-3 text-sm even:bg-gray-100 flex items-center"
                      >
                        {diffInDays <= 7 && (
                          <div
                            className={cn(
                              "rounded-xl border bg-gray-500/10 border-gray-500 text-gray-500 px-2 py-0.5 mr-2 flex items-center gap-2 font-semibold  text-xs",
                              !archive &&
                                "bg-yellow-500/10 border-yellow-500 text-yellow-500",
                              !archive &&
                                diffInDays <= 1 &&
                                "bg-red-500/10 border-red-500 text-red-500"
                            )}
                          >
                            <AlertTriangleIcon className="h-4 w-4" />
                            {diffInDays > 1 ? "Recent" : "New"}
                          </div>
                        )}
                        <div>
                          <p>{check.checkMsg}</p>
                          <p className="text-xs text-muted-foreground">
                            Last Change:{" "}
                            {new UTCDate(
                              check.lastPassed ?? check.firstSeen
                            ).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                <CardFooter className="justify-end pb-3">
                  <Button asChild variant="outline">
                    <Link
                      href={`/allocators/${result.allocatorId}/reports/${reportId}`}
                    >
                      View Report
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
