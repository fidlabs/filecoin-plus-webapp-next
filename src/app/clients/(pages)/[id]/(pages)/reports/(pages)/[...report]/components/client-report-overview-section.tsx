"use client";

import { useReportsDetails } from "@/app/clients/(pages)/[id]/(pages)/reports/(pages)/[...report]/providers/reports-details.provider";
import { useScrollObserver } from "@/lib/hooks/useScrollObserver";
import { cn } from "@/lib/utils";

export function ClientReportOverviewSection() {
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
        <h2 className="font-semibold text-lg">Client Overview</h2>
      </div>
      {reports.map((report, index) => {
        return (
          <div
            key={index}
            className="p-4 border-b [&:not(:last-child)]:border-r-2 flex items-center space-x-2"
          >
            <div className="p-4 border rounded-lg">
              <h5 className="text-sm mb-1">Type of Data</h5>
              <p className="text-lg font-semibold">
                {report.is_public_dataset ? "Open" : "Enterprise"}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
