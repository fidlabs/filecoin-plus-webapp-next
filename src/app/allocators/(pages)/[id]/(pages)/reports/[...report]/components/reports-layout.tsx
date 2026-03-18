"use client";

import { ClientOnlyWrapper } from "@/components/client-only-wrapper";
import { Container } from "@/components/container";
import { GenericContentHeader } from "@/components/generic-content-view";
import { Card, CardContent } from "@/components/ui/card";
import { type ICDPAllocatorFullReport } from "@/lib/interfaces/cdp/cdp.interface";
import { format } from "date-fns";
import { useState } from "react";
import { AllocatorReportDataTypesSection } from "./allocator-report-data-types-section";
import { AllocatorReportOverviewSection } from "./allocator-report-overview-section";
import { AllocatorReportScoringSection } from "./allocator-report-scoring-section";
import { ClientsView } from "./clients-view/clients-view";
import { EnableCompareButton } from "./enable-compare.button";
import { ProvidersView } from "./provider-view/providers-view";

function parseId(id: string) {
  if (id.length > 10) {
    return id.substring(0, 8) + "..." + id.substring(id.length - 4);
  } else {
    return id;
  }
}

export interface ReportsLayoutProps {
  allocatorId: string;
  reports: ICDPAllocatorFullReport[];
}

export function ReportsLayout({ allocatorId, reports }: ReportsLayoutProps) {
  const [comparsionEnabled, setComparsionEnabled] = useState(true);

  const content = (
    <Card>
      <GenericContentHeader
        header="Report Detail"
        sticky
        addons={
          reports.length >= 2 && (
            <EnableCompareButton
              comparsionEnabled={comparsionEnabled}
              onComparsionEnabledChange={setComparsionEnabled}
            />
          )
        }
        fixedHeight={true}
      />
      <CardContent className="p-0">
        <div
          className="grid border-b sticky top-[90px] bg-white z-10"
          style={{
            gridTemplateColumns: `repeat(${reports.length}, minmax(0, 1fr))`,
          }}
        >
          {reports.map((report, index) => {
            return (
              <div
                key={index}
                className="[&:not(:last-child)]:border-r-2 p-4 flex gap-1 items-center"
              >
                Report{" "}
                <span className="font-semibold">{parseId(report.id)}</span> from{" "}
                <ClientOnlyWrapper>
                  <span className="font-semibold">
                    {format(new Date(report.create_date), "yyyy-MM-dd HH:mm")}
                  </span>
                </ClientOnlyWrapper>
              </div>
            );
          })}
        </div>
        <AllocatorReportScoringSection reports={reports} />
        <AllocatorReportOverviewSection reports={reports} />
        <AllocatorReportDataTypesSection reports={reports} />
        <ClientsView allocatorId={allocatorId} reports={reports} />
        <ProvidersView
          allocatorId={allocatorId}
          comparsionEnabled={comparsionEnabled}
          reports={reports}
        />
      </CardContent>
    </Card>
  );

  return reports.length > 2 ? (
    <div className="mx-4">{content}</div>
  ) : (
    <Container>{content}</Container>
  );
}
