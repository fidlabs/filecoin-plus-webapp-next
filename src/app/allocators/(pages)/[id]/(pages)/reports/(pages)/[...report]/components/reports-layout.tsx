"use client";

import { ClientsView } from "@/app/allocators/(pages)/[id]/(pages)/reports/(pages)/[...report]/components/clients-view/clients-view";
import { EnableCompareButton } from "@/app/allocators/(pages)/[id]/(pages)/reports/(pages)/[...report]/components/enable-compare.button";
import { ProvidersView } from "@/app/allocators/(pages)/[id]/(pages)/reports/(pages)/[...report]/components/provider-view/providers-view";
import { useReportsDetails } from "@/app/allocators/(pages)/[id]/(pages)/reports/(pages)/[...report]/providers/reports-details.provider";
import { ClientOnlyWrapper } from "@/components/client-only-wrapper";
import { GenericContentHeader } from "@/components/generic-content-view";
import { Card, CardContent } from "@/components/ui/card";
import {
  IAllocatorReportClientPaginationQuery,
  IAllocatorReportProviderPaginationQuery,
} from "@/lib/interfaces/api.interface";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { AllocatorReportDataTypesSection } from "./allocator-report-data-types-section";
import { AllocatorReportOverviewSection } from "./allocator-report-overview-section";
import { AllocatorReportScoringSection } from "./allocator-report-scoring-section";

function parseId(id: string) {
  if (id.length > 10) {
    return id.substring(0, 8) + "..." + id.substring(id.length - 4);
  } else {
    return id;
  }
}

export function ReportsLayout({
  queryParams,
}: {
  queryParams?: IAllocatorReportClientPaginationQuery &
    IAllocatorReportProviderPaginationQuery;
}) {
  const { colsStyle, reports } = useReportsDetails();

  return (
    <div className={cn(reports.length > 2 ? "mx-4" : "main-content")}>
      <Card>
        <GenericContentHeader
          header="Report Detail"
          sticky
          addons={reports.length >= 2 && <EnableCompareButton />}
          fixedHeight={true}
        />
        <CardContent className="p-0">
          <div
            className={cn("grid border-b sticky top-[90px] bg-white z-10")}
            style={colsStyle}
          >
            {reports.map((report, index) => {
              return (
                <div
                  key={index}
                  className="[&:not(:last-child)]:border-r-2 p-4 flex gap-1 items-center"
                >
                  Report{" "}
                  <span className="font-semibold">{parseId(report.id)}</span>{" "}
                  from{" "}
                  <ClientOnlyWrapper>
                    <span className="font-semibold">
                      {format(new Date(report.create_date), "yyyy-MM-dd HH:mm")}
                    </span>
                  </ClientOnlyWrapper>
                </div>
              );
            })}
          </div>
          <AllocatorReportScoringSection />
          <AllocatorReportOverviewSection />
          <AllocatorReportDataTypesSection />
          <ClientsView
            queryParams={{
              clientPaginationPage: queryParams?.clientPaginationPage,
              clientPaginationLimit: queryParams?.clientPaginationLimit,
            }}
          />
          <ProvidersView
            queryParams={{
              providerPaginationPage: queryParams?.providerPaginationPage,
              providerPaginationLimit: queryParams?.providerPaginationLimit,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
