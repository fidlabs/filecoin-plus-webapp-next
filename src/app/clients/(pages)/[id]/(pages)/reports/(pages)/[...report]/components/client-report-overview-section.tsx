"use client";

import { useReportsDetails } from "@/app/clients/(pages)/[id]/(pages)/reports/(pages)/[...report]/providers/reports-details.provider";
import { useScrollObserver } from "@/lib/hooks/useScrollObserver";
import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

interface OverviewItem {
  label: ReactNode;
  value: ReactNode;
}

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
        const overviewItems: OverviewItem[] = [
          {
            label: "Type of Data",
            value: report.is_public_dataset ? "Open" : "Enterprise",
          },
          {
            label: "Using Contract",
            value: report.using_client_contract ? "Yes" : "No",
          },
          {
            label: "Client Contract Deviation",
            value: report.using_client_contract
              ? report.client_contract_max_deviation
              : "N/A",
          },
          {
            label: "Average Time To First Deal",
            value:
              report.avg_secs_to_first_deal && report.avg_secs_to_first_deal > 0
                ? `${(report.avg_secs_to_first_deal / 86400).toFixed(2)} ${
                    report.avg_secs_to_first_deal / 86400 < 2 ? "day" : "days"
                  }` // Convert seconds to days
                : "N/A",
          },
        ];

        return (
          <div
            key={index}
            className="p-4 border-b [&:not(:last-child)]:border-r-2 flex items-center space-x-2"
          >
            {overviewItems.map((item, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <h5 className="text-sm mb-1">{item.label}</h5>
                <p className="text-lg font-semibold">{item.value}</p>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
