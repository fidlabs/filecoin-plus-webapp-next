"use client";

import { useScrollObserver } from "@/lib/hooks/useScrollObserver";
import { cn } from "@/lib/utils";
import { useReportsDetails } from "../providers/reports-details.provider";

export function AllocatorReportDataTypesSection() {
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
        <h2 className="font-semibold text-lg">Data Types</h2>
      </div>
      {reports.map((report, index) => {
        return (
          <div
            key={index}
            className="p-4 border-b [&:not(:last-child)]:border-r-2 flex items-center space-x-2"
          >
            {report.data_types.map((dataType, index) => (
              <div
                key={index}
                className="rounded-md px-2.5 py-1 text-xs font-semibold transition-colors focus:outline-none border-transparent bg-secondary text-secondary-foreground shadow hover:bg-secondary/80"
              >
                {dataType}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
