"use client";

import { AllocatorScoreBadge } from "@/components/allocator-score-badge";
import { useScrollObserver } from "@/lib/hooks/useScrollObserver";
import { cn } from "@/lib/utils";
import { useReportsDetails } from "../providers/reports-details.provider";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function AllocatorReportScoringSection() {
  const { colsStyle, colsSpanStyle, reports } = useReportsDetails();
  const { top, ref } = useScrollObserver();

  return (
    <div className="grid" style={colsStyle}>
      <div
        ref={ref}
        className={cn(
          "p-4 border-b sticky top-[147px] bg-white",
          top > 90 && "z-[5]",
          top === 147 && "shadow-md"
        )}
        style={colsSpanStyle}
      >
        <h2 className="font-semibold text-lg">Allocator Score</h2>
      </div>

      {reports.map((report, index) => {
        return (
          <div
            key={index}
            className="p-4 border-b [&:not(:last-child)]:border-r-2 flex items-center space-x-2"
          >
            <AllocatorScoreBadge
              scoringResults={report.scoring_results}
              averageScore={report.all_allocators_score_avg}
            />
            <div>
              <p className="text-sm text-muted-foreground">
                Total Allocator Score
              </p>
              <Button variant="link" asChild>
                <Link
                  href={`/allocators/${report.allocator}/score/${report.id}`}
                >
                  View Score Breakdown
                </Link>
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
