"use client";

import { useScrollObserver } from "@/lib/hooks/useScrollObserver";
import {
  ClientReportCheckType,
  type IClientFullReport,
} from "@/lib/interfaces/cdp/cdp.interface";
import { cn } from "@/lib/utils";
import { CircleAlertIcon, CircleCheckIcon } from "lucide-react";

export interface ClientReportActivitySectionProps {
  reports: IClientFullReport[];
}

export function ClientReportActivitySection({
  reports,
}: ClientReportActivitySectionProps) {
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
        <h2 className="font-semibold text-lg">Activity</h2>
      </div>

      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${reports.length}, minmax(0, 1fr))`,
        }}
      >
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
                {inactivityCheck?.metadata.msg ??
                  "Activity status not available"}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
