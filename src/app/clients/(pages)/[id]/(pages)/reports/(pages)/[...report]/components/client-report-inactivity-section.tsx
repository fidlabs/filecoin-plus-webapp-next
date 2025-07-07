"use client";
import { useReportsDetails } from "@/app/clients/(pages)/[id]/(pages)/reports/(pages)/[...report]/providers/reports-details.provider";
import { useScrollObserver } from "@/lib/hooks/useScrollObserver";
import { ClientReportCheckType } from "@/lib/interfaces/cdp/cdp.interface";
import { cn } from "@/lib/utils";
import { CircleAlertIcon, CircleCheckIcon } from "lucide-react";

export function ClientReportActivitySection() {
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
        <h2 className="font-semibold text-lg">Activity</h2>
      </div>
      {reports.map((report, index) => {
        const inactivityCheck = report.check_results.find(
          (check) => check.check === ClientReportCheckType.INACTIVITY
        );

        return (
          <div
            key={index}
            className="p-4 border-b [&:not(:last-child)]:border-r-2 flex items-center space-x-2"
          >
            {!!inactivityCheck?.result ? (
              <CircleCheckIcon className="text-green-500" />
            ) : (
              <CircleAlertIcon className="text-yellow-500" />
            )}
            <p>
              {inactivityCheck?.metadata.msg ?? "Activity status not available"}
            </p>
          </div>
        );
      })}
    </div>
  );
}
