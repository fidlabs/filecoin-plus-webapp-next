"use client";

import { useScrollObserver } from "@/lib/hooks/useScrollObserver";
import { cn } from "@/lib/utils";
import { type ReactNode } from "react";
import { useReportsDetails } from "../providers/reports-details.provider";
import { CopyButton } from "@/components/copy-button";

interface OverviewItem {
  label: ReactNode;
  value: ReactNode;
  copyOptions?: {
    copyText: string;
    tooltipText: ReactNode;
    successText: string;
  };
}

export function AllocatorReportOverviewSection() {
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
        <h2 className="font-semibold text-lg">Allocator Overview</h2>
      </div>
      {reports.map((report, index) => {
        const overviewItems: OverviewItem[] = [
          {
            label: "Chain Address",
            value: `${report.address.slice(0, 4)}...${report.address.slice(-4)}`,
            copyOptions: {
              copyText: report.address,
              successText: "Address copied",
              tooltipText: "Copy Address",
            },
          },
          {
            label: "Number of Clients",
            value: report.clients_number,
          },
          {
            label: "Is Multisig",
            value: report.multisig ? "Yes" : "No",
          },
          {
            label: "Average Retrievability Success Rate",
            value:
              typeof report.avg_retrievability_success_rate === "number"
                ? (report.avg_retrievability_success_rate * 100).toFixed(2) +
                  "%"
                : "N/A",
          },
          {
            label: "Required Copies",
            value: report.required_copies,
          },
        ];

        return (
          <div
            key={index}
            className="p-4 border-b [&:not(:last-child)]:border-r-2 flex items-center space-x-2"
          >
            {overviewItems.map((item, index) => (
              <div key={index} className=" p-4 border rounded-lg">
                <h5 className="text-sm mb-1">{item.label}</h5>
                <div className="flex items-center space-x-2">
                  <p className="text-lg font-semibold">{item.value}</p>
                  {!!item.copyOptions && (
                    <CopyButton
                      copyText={item.copyOptions.copyText}
                      successText={item.copyOptions.successText}
                      tooltipText={item.copyOptions.tooltipText}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
