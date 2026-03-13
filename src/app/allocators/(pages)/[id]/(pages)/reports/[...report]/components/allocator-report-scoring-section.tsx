"use client";

import { AllocatorScoreBadge } from "@/components/allocator-score-badge";
import { Button } from "@/components/ui/button";
import { useScrollObserver } from "@/lib/hooks/useScrollObserver";
import { type ICDPAllocatorFullReport } from "@/lib/interfaces/cdp/cdp.interface";
import { cn } from "@/lib/utils";
import Link from "next/link";

export interface AllocatorReportScoringSectionProps {
  reports: ICDPAllocatorFullReport[];
}

export function AllocatorReportScoringSection({
  reports,
}: AllocatorReportScoringSectionProps) {
  const { top, ref } = useScrollObserver();

  return (
    <div>
      <div
        ref={ref}
        className={cn(
          "p-4 border-b sticky top-[147px] bg-white",
          top > 90 && "z-[5]",
          top === 147 && "shadow-md"
        )}
      >
        <h2 className="font-semibold text-lg">Allocator Score</h2>
      </div>

      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${reports.length}, minmax(0, 1fr))`,
        }}
      >
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
    </div>
  );
}
