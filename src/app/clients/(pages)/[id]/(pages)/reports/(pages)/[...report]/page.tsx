import { ReportsLayout } from "@/app/clients/(pages)/[id]/(pages)/reports/(pages)/[...report]/components/reports-layout";
import { parseReports } from "@/app/clients/(pages)/[id]/(pages)/reports/(pages)/[...report]/helpers";
import { ReportsDetailsProvider } from "@/app/clients/(pages)/[id]/(pages)/reports/(pages)/[...report]/providers/reports-details.provider";
import { getClientReportById } from "@/lib/api";
import { isHTTPError } from "@/lib/http-errors";
import { notFound } from "next/navigation";

export const revalidate = 3600;

interface PageProps {
  params: { report: string[]; id: string };
}

export default async function ClientReportDetailPage({ params }: PageProps) {
  try {
    const reports = await Promise.all(
      params.report.map(async (report) =>
        getClientReportById(params.id, report)
      )
    );

    return (
      <ReportsDetailsProvider reports={parseReports(reports)}>
        <ReportsLayout />
      </ReportsDetailsProvider>
    );
  } catch (error) {
    if (isHTTPError(error) && error.status === 404) {
      return notFound();
    }

    throw error;
  }
}
