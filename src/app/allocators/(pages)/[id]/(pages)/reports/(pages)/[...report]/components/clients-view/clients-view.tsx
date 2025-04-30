"use client";

import { ClientsViewTable } from "@/app/allocators/(pages)/[id]/(pages)/reports/(pages)/[...report]/components/clients-view/clients-view-table";
import { useReportsDetails } from "@/app/allocators/(pages)/[id]/(pages)/reports/(pages)/[...report]/providers/reports-details.provider";
import { useScrollObserver } from "@/lib/hooks/useScrollObserver";
import { cn } from "@/lib/utils";
import { TriangleAlertIcon } from "lucide-react";

export function ClientsView() {
  const { colsStyle, colsSpanStyle, reports } = useReportsDetails();
  const { top, ref } = useScrollObserver();

  const showMarkedClientsExplanation = reports.some((report) => {
    return (
      report.check_results.findIndex(
        (result) =>
          result.check === "CLIENT_MULTIPLE_ALLOCATORS" &&
          result.metadata.violating_ids.length > 0
      ) !== -1
    );
  });

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
        <h2 className="font-semibold text-lg">Clients overview</h2>

        {showMarkedClientsExplanation && (
          <p className="text-sm mt-2">
            Clients marked with{" "}
            <TriangleAlertIcon className="inline h-4 w-4 text-yellow-600" />{" "}
            received DataCap from more than one allocator.
          </p>
        )}
      </div>

      {reports.map((report, index) => {
        const markedIds = report.check_results.find(
          (result) => result.check === "CLIENT_MULTIPLE_ALLOCATORS"
        )?.metadata.violating_ids;

        return (
          <div key={index} className="border-b [&:not(:last-child)]:border-r-2">
            <ClientsViewTable clients={report.clients} markedIds={markedIds} />
          </div>
        );
      })}
    </div>
  );
}
