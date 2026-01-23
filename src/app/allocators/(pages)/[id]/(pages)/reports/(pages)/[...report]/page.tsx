import { getAllocatorReportById } from "@/lib/api";
import { isHTTPError } from "@/lib/http-errors";
import { notFound } from "next/navigation";
import { ReportsLayout } from "./components/reports-layout";

export const revalidate = 3600;

interface PageProps {
  params: { report: string[]; id: string };
  searchParams?: Record<string, string | undefined>;
}

export default async function AllocatorReportDetailPage({
  params,
  searchParams,
}: PageProps) {
  const queryParams = {
    clientPaginationPage: searchParams?.clientPaginationPage ?? "1",
    clientPaginationLimit: searchParams?.clientPaginationLimit ?? "10",
    providerPaginationPage: searchParams?.providerPaginationPage ?? "1",
    providerPaginationLimit: searchParams?.providerPaginationLimit ?? "10",
  };

  try {
    const reports = await Promise.all(
      params.report.map((report) =>
        getAllocatorReportById(params.id, report, queryParams)
      )
    );

    const reportsSortedByDateAsc = reports.toSorted((reportA, reportB) => {
      const dateA = new Date(reportA.create_date).valueOf();
      const dateB = new Date(reportB.create_date).valueOf();

      return dateA - dateB;
    });

    return <ReportsLayout reports={reportsSortedByDateAsc} />;
  } catch (error) {
    if (isHTTPError(error) && error.status === 404) {
      return notFound();
    }

    throw error;
  }
}
