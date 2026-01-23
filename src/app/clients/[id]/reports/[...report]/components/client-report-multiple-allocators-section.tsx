"use client";

import { useScrollObserver } from "@/lib/hooks/useScrollObserver";
import {
  ClientReportCheckType,
  type IClientFullReport,
} from "@/lib/interfaces/cdp/cdp.interface";
import { cn } from "@/lib/utils";
import { CircleAlertIcon, CircleCheckIcon } from "lucide-react";

export interface ClientReportMultipleAllocatorsSectionProps {
  reports: IClientFullReport[];
}

export function ClientReportMultipleAllocatorsSection({
  reports,
}: ClientReportMultipleAllocatorsSectionProps) {
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
        <h2 className="font-semibold text-lg">DataCap Allocations</h2>
      </div>

      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${reports.length}, minmax(0, 1fr))`,
        }}
      >
        {reports.map((report, index) => {
          const hasMultipleAllocators =
            report.check_results.find(
              (check) =>
                check.check === ClientReportCheckType.MULTIPLE_ALLOCATORS
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
    </div>
  );
}
