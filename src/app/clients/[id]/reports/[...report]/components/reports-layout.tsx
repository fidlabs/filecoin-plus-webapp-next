"use client";

import { ClientOnlyWrapper } from "@/components/client-only-wrapper";
import { Container } from "@/components/container";
import { GenericContentHeader } from "@/components/generic-content-view";
import { GithubIcon } from "@/components/icons/github.icon";
import { Card, CardContent } from "@/components/ui/card";
import { type IClientFullReport } from "@/lib/interfaces/cdp/cdp.interface";
import { format } from "date-fns";
import Link from "next/link";
import { useState } from "react";
import { ReportViewCidSharing } from "./cid-sharing-view/report-view-cid-sharing";
import { ClientReportActivitySection } from "./client-report-inactivity-section";
import { ClientReportMultipleAllocatorsSection } from "./client-report-multiple-allocators-section";
import { ClientReportOverviewSection } from "./client-report-overview-section";
import { EnableCompareButton } from "./enable-compare.button";
import { ReportViewProviders } from "./provider-view/report-view-providers";
import { ReportViewReplicas } from "./replicas-view/report-view-replicas";

export interface ReportsLayoutProps {
  reports: IClientFullReport[];
}

export function ReportsLayout({ reports }: ReportsLayoutProps) {
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
                Report <span className="font-semibold">{report.id}</span> from{" "}
                <ClientOnlyWrapper>
                  <span className="font-semibold">
                    {format(new Date(report.create_date), "yyyy-MM-dd HH:mm")}
                  </span>
                </ClientOnlyWrapper>
                {report.application_url && (
                  <Link
                    className="text-gray-500 hover:text-gray-900"
                    target="_blank"
                    href={report.application_url}
                  >
                    <GithubIcon width={15} height={15} />
                  </Link>
                )}
              </div>
            );
          })}
        </div>
        <ClientReportOverviewSection reports={reports} />
        <ClientReportMultipleAllocatorsSection reports={reports} />
        <ClientReportActivitySection reports={reports} />
        <ReportViewProviders
          reports={reports}
          comparsionEnabled={comparsionEnabled}
        />
        <ReportViewReplicas
          comparsionEnabled={comparsionEnabled}
          reports={reports}
        />
        <ReportViewCidSharing
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
