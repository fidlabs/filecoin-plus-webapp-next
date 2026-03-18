"use client";

import { AllocatorScoreBadge } from "@/components/allocator-score-badge";
import { AllocatorScoreResultChart } from "@/components/allocator-score-result-chart";
import { ChartStat } from "@/components/chart-stat";
import { OverlayLoader } from "@/components/overlay-loader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChartLoader } from "@/components/ui/chart-loader";
import { Skeleton } from "@/components/ui/skeleton";
import { getAllocatorReportById } from "@/lib/api";
import { ALLOCATOR_SCORE_REPORT_ID_QUERY_KEY, QueryKey } from "@/lib/constants";
import { useDelayedFlag } from "@/lib/hooks/use-delayed-flag";
import { isHTTPError } from "@/lib/http-errors";
import { type ICDPAllocatorFullReport } from "@/lib/interfaces/cdp/cdp.interface";
import { useQueryState } from "nuqs";
import { type ComponentProps, useCallback, useEffect, useMemo } from "react";
import useSWR from "swr";

interface FetchReportParameters {
  allocatorId: string;
  reportId: string | null;
}

interface ReportData {
  report: ICDPAllocatorFullReport;
  reportObsolete: boolean;
}

type CardProps = ComponentProps<typeof Card>;
export interface AllocatorScoreWidgetProps extends Omit<CardProps, "children"> {
  allocatorId: string;
}

async function fetchReportData({
  allocatorId,
  reportId,
}: FetchReportParameters): Promise<ReportData> {
  const latestReport = await getAllocatorReportById({
    allocatorId,
    reportId: "latest",
  });

  if (!reportId || latestReport.id === reportId) {
    return {
      report: latestReport,
      reportObsolete: false,
    };
  }

  const report = await getAllocatorReportById({
    allocatorId,
    reportId,
  });

  return {
    report,
    reportObsolete: true,
  };
}

export function AllocatorScoreWidget({
  allocatorId,
  ...rest
}: AllocatorScoreWidgetProps) {
  const [reportId, setReportId] = useQueryState(
    ALLOCATOR_SCORE_REPORT_ID_QUERY_KEY
  );
  const { data, error, isLoading, mutate } = useSWR(
    [QueryKey.ALLOCATOR_SCORE, allocatorId, reportId],
    ([, allocatorId, reportId]) => {
      return fetchReportData({ allocatorId, reportId });
    },
    {
      revalidateOnMount: false,
    }
  );
  const isLongLoading = useDelayedFlag(isLoading, 500);

  const [totalScore, maxTotalScore] = useMemo(() => {
    if (!data) {
      return [0, 0];
    }

    return data.report.scoring_results.reduce(
      ([currentTotalScore, currentMaxTotalScore], result) => {
        const maxScore = Math.max(...result.ranges.map((range) => range.score));

        return [
          currentTotalScore + result.score,
          currentMaxTotalScore + maxScore,
        ];
      },
      [0, 0]
    );
  }, [data]);

  const resetReport = useCallback(() => {
    setReportId(null);
  }, [setReportId]);

  useEffect(() => {
    if (reportId !== null && isHTTPError(error) && error.status === 404) {
      setReportId(null);
    }
  }, [error, reportId, setReportId]);

  useEffect(() => {
    if (!data && !error && !isLoading) {
      mutate();
    }
  }, [data, error, isLoading, mutate]);

  return (
    <Card {...rest}>
      <div className="px-4 pt-4 flex justify-between gap-2">
        <div>
          <header className="mb-4">
            <h3 className="text-lg font-semibold">Score</h3>
            <p className="text-xs text-muted-foreground">
              Allocator Score with per metric breakdown
            </p>
          </header>

          <div className="flex flex-wrap gap-x-8 gap-y-4">
            <ChartStat
              label="Allocator Score"
              value={data ? `${totalScore} / ${maxTotalScore}` : null}
            />

            <ChartStat
              label="Average Score"
              value={data?.report.all_allocators_score_avg?.toFixed(2) ?? null}
            />
          </div>
        </div>

        {data ? (
          <AllocatorScoreBadge
            averageScore={data.report.all_allocators_score_avg}
            scoringResults={data.report.scoring_results}
          />
        ) : (
          <Skeleton className="h-[96px] w-[96px] rounded-full" />
        )}
      </div>

      {!!data?.reportObsolete && (
        <div className="flex items-center justify-between border-t border-b border-orange-500 bg-orange-500/20 p-4 mt-4">
          <p className="text-sm">You are viewing score for past report</p>
          <Button
            variant="ghost"
            size="sm"
            className="hover:bg-transparent hover:text-primary"
            onClick={resetReport}
          >
            View Recent Score
          </Button>
        </div>
      )}

      <div className="pt-6 relative">
        {!!error && !isLoading && (
          <p className="text-center my-6 text-sm text-muted-foreground">
            An error occured. Please try again later.
          </p>
        )}

        {!data && isLoading && (
          <div className="flex items-center justify-center">
            <ChartLoader />
          </div>
        )}

        {!!data && !error && (
          <>
            <div className="grid lg:grid-cols-2 min-[1600px]:grid-cols-3 border-t">
              {data.report.scoring_results.map((result) => {
                return (
                  <div
                    key={result.metric}
                    className="border-r border-b px-2 py-4"
                  >
                    <AllocatorScoreResultChart result={result} />
                  </div>
                );
              })}
            </div>
            <OverlayLoader show={isLongLoading} />
          </>
        )}
      </div>
    </Card>
  );
}
