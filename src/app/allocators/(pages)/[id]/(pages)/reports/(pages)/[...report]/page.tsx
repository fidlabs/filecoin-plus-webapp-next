import { ReportsLayout } from "@/app/allocators/(pages)/[id]/(pages)/reports/(pages)/[...report]/components/reports-layout";
import { parseReports } from "@/app/allocators/(pages)/[id]/(pages)/reports/(pages)/[...report]/helpers";
import { ReportsDetailsProvider } from "@/app/allocators/(pages)/[id]/(pages)/reports/(pages)/[...report]/providers/reports-details.provider";
import { getAllocatorReportById } from "@/lib/api";
import { isHTTPError } from "@/lib/http-errors";
import {
  IAllocatorReportClientPaginationQuery,
  IAllocatorReportProviderPaginationQuery,
} from "@/lib/interfaces/api.interface";
import { notFound } from "next/navigation";

export const revalidate = 3600;

interface PageProps {
  params: { report: string[]; id: string };
  searchParams?: IAllocatorReportClientPaginationQuery &
    IAllocatorReportProviderPaginationQuery;
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
      params.report.map(async (report) =>
        getAllocatorReportById(params.id, report, queryParams)
      )
    );

    return (
      <ReportsDetailsProvider reports={parseReports(reports)}>
        <ReportsLayout queryParams={queryParams} />
      </ReportsDetailsProvider>
    );
  } catch (error) {
    if (isHTTPError(error) && error.status === 404) {
      return notFound();
    }

    throw error;
  }
}
