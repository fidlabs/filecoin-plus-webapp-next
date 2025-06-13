"use client";

import { ClientOnlyWrapper } from "@/components/client-only-wrapper";
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
import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";

export interface AlertsListProps {
  data: AllocatorsDailyReportChecksResponse;
}

export function AlertsList({ data }: AlertsListProps) {
  const { filters } = useSearchParamsFilters();
  const containerRef = useRef<HTMLDivElement | null>(null);

  const visibleResults = useMemo(() => {
    return data.results.filter((result) => result.checksFailedCount > 0);
  }, [data]);

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
          with failed checks on{" "}
          <ClientOnlyWrapper>
            <span>
              {new Date(data.day).toLocaleString(undefined, {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </span>
          </ClientOnlyWrapper>
        </p>
      </div>

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
                          {result.allocatorName}
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
                  {result.failedChecks.map((check, index) => (
                    <li
                      key={index}
                      className="px-6 py-3 text-sm even:bg-gray-100"
                    >
                      {check.checkMsg}
                    </li>
                  ))}
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
