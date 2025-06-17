import { ReportsLayout } from "@/app/allocators/(pages)/[id]/(pages)/reports/(pages)/[...report]/components/reports-layout";
import { parseReports } from "@/app/allocators/(pages)/[id]/(pages)/reports/(pages)/[...report]/helpers";
import { ReportsDetailsProvider } from "@/app/allocators/(pages)/[id]/(pages)/reports/(pages)/[...report]/providers/reports-details.provider";
import { getAllocatorReportById } from "@/lib/api";
import { isHTTPError } from "@/lib/http-errors";
import { notFound } from "next/navigation";

export const revalidate = 3600;

interface PageProps {
  params: { report: string[]; id: string };
}

export default async function AllocatorReportDetailPage({ params }: PageProps) {
  try {
    const reports = await Promise.all(
      params.report.map(async (report) =>
        getAllocatorReportById(params.id, report)
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
