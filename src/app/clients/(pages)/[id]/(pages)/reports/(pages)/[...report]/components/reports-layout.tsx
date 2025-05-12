"use client";
import { GenericContentHeader } from "@/components/generic-content-view";
import { Card, CardContent } from "@/components/ui/card";
import { ReportViewProviders } from "@/app/clients/(pages)/[id]/(pages)/reports/(pages)/[...report]/components/provider-view/report-view-providers";
import { EnableCompareButton } from "@/app/clients/(pages)/[id]/(pages)/reports/(pages)/[...report]/components/enable-compare.button";
import { useReportsDetails } from "@/app/clients/(pages)/[id]/(pages)/reports/(pages)/[...report]/providers/reports-details.provider";
import { format } from "date-fns";
import { ReportViewReplicas } from "@/app/clients/(pages)/[id]/(pages)/reports/(pages)/[...report]/components/replikas-view/report-view-replikas";
import { cn } from "@/lib/utils";
import { ReportViewCidSharing } from "@/app/clients/(pages)/[id]/(pages)/reports/(pages)/[...report]/components/cid-sharing-view/report-view-cid-sharing";
import { GithubIcon } from "@/components/icons/github.icon";
import Link from "next/link";
import { ClientReportMultipleAllocatorsSection } from "./client-report-multiple-allocators-section";
import { ClientReportOverviewSection } from "./client-report-overview-section";

const ReportsLayout = () => {
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
                  Report <span className="font-semibold">{report.id}</span> from{" "}
                  <span className="font-semibold">
                    {format(new Date(report.create_date), "yyyy-MM-dd HH:mm")}
                  </span>
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
          <ClientReportOverviewSection />
          <ClientReportMultipleAllocatorsSection />
          <ReportViewProviders />
          <ReportViewReplicas />
          <ReportViewCidSharing />
        </CardContent>
      </Card>
    </div>
  );
};

export { ReportsLayout };
