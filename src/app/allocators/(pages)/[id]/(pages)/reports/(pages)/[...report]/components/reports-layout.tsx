"use client";

import { ClientOnlyWrapper } from "@/components/client-only-wrapper";
import { Container } from "@/components/container";
import { GenericContentHeader } from "@/components/generic-content-view";
import { Card, CardContent } from "@/components/ui/card";
import { ICDPAllocatorFullReport } from "@/lib/interfaces/cdp/cdp.interface";
import { format } from "date-fns";
import { parseAsInteger, useQueryState } from "nuqs";
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
  reports: ICDPAllocatorFullReport[];
}

const clientsPageParamKey = "clientPaginationPage";
const clientsPageSizeParamKey = "clientPaginationLimit";
const providersPageParamKey = "providerPaginationPage";
const providersPageSizeParamKey = "providerPaginationLimit";

export function ReportsLayout({ reports }: ReportsLayoutProps) {
  const [comparsionEnabled, setComparsionEnabled] = useState(true);
  const [clientsPage, setClientsPage] = useQueryState(
    clientsPageParamKey,
    parseAsInteger.withDefault(1)
  );
  const [clientsPageSize, setClientsPageSize] = useQueryState(
    clientsPageSizeParamKey,
    parseAsInteger.withDefault(10)
  );
  const [providersPage, setProvidersPage] = useQueryState(
    providersPageParamKey,
    parseAsInteger.withDefault(1)
  );
  const [providersPageSize, setProvidersPageSize] = useQueryState(
    providersPageSizeParamKey,
    parseAsInteger.withDefault(10)
  );

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
        <ClientsView
          reports={reports}
          page={clientsPage}
          pageSize={clientsPageSize}
          onPageChange={setClientsPage}
          onPageSizeChange={setClientsPageSize}
        />
        <ProvidersView
          comparsionEnabled={comparsionEnabled}
          reports={reports}
          page={providersPage}
          pageSize={providersPageSize}
          onPageChange={setProvidersPage}
          onPageSizeChange={setProvidersPageSize}
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
