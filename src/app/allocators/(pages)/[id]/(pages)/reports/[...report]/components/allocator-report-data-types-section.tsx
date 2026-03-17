"use client";

import { useScrollObserver } from "@/lib/hooks/useScrollObserver";
import { type ICDPAllocatorFullReport } from "@/lib/interfaces/cdp/cdp.interface";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

export interface AllocatorReportDataTypesSectionProps {
  reports: ICDPAllocatorFullReport[];
}

export function AllocatorReportDataTypesSection({
  reports,
}: AllocatorReportDataTypesSectionProps) {
  const reportsWithAuditTypesCount = reports.filter(
    (report) => Array.isArray(report.audit) && report.audit.length > 0
  ).length;

  const heading = useMemo(() => {
    if (reportsWithAuditTypesCount === reports.length) {
      return "Audit Types";
    } else if (reportsWithAuditTypesCount > 0) {
      return "Data Types / Audit Types";
    } else {
      return "Data Types";
    }
  }, [reportsWithAuditTypesCount, reports.length]);

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
        <h2 className="font-semibold text-lg">{heading}</h2>
      </div>

      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${reports.length}, minmax(0, 1fr))`,
        }}
      >
        {reports.map((report, index) => {
          const items =
            Array.isArray(report.audit) && report.audit.length > 0
              ? report.audit.filter((item) => typeof item === "string")
              : report.data_types;

          return (
            <div
              key={index}
              className="p-4 border-b [&:not(:last-child)]:border-r-2 flex flex-wrap items-center"
            >
              {items.map((dataType, index) => (
                <div
                  key={index}
                  className="rounded-md px-2.5 mr-2 mb-2 py-1 text-xs font-semibold transition-colors focus:outline-none border-transparent bg-secondary text-secondary-foreground shadow hover:bg-secondary/80"
                >
                  {dataType}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
