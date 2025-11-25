"use client";

import { useScrollObserver } from "@/lib/hooks/useScrollObserver";
import { ClientReportCheckType } from "@/lib/interfaces/cdp/cdp.interface";
import { cn } from "@/lib/utils";
import { CircleAlertIcon, CircleCheckIcon } from "lucide-react";
import { useReportsDetails } from "../providers/reports-details.provider";

export function ClientReportMultipleAllocatorsSection() {
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
        <h2 className="font-semibold text-lg">DataCap Allocations</h2>
      </div>
      {reports.map((report, index) => {
        const hasMultipleAllocators =
          report.check_results.find(
            (check) => check.check === ClientReportCheckType.MULTIPLE_ALLOCATORS
          )?.result === false;

        return (
          <div
            key={index}
            className="p-4 border-b [&:not(:last-child)]:border-r-2 flex items-center space-x-2"
          >
            {hasMultipleAllocators ? (
              <CircleAlertIcon className="text-yellow-500" />
            ) : (
              <CircleCheckIcon className="text-green-500" />
            )}
            <p>
              {hasMultipleAllocators
                ? "Client is receiving DataCap from multiple allocators."
                : "Client is receiving DataCap from single allocator."}
            </p>
          </div>
        );
      })}
    </div>
  );
}
