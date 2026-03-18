import {
  getAllocatorReportById,
  type GetAllocatorReportByIdParameters,
} from "@/lib/api";
import { QueryKey } from "@/lib/constants";
import { isHTTPError } from "@/lib/http-errors";
import { notFound } from "next/navigation";
import { SWRConfig, unstable_serialize } from "swr";
import { ReportsLayout } from "./components/reports-layout";

export const revalidate = 3600;

interface PageProps {
  params: { report: string[]; id: string };
  searchParams?: Record<string, string | undefined>;
}

const reportDefaultParameters: Omit<
  GetAllocatorReportByIdParameters,
  "allocatorId" | "reportId"
> = {
  clientPaginationPage: 1,
  clientPaginationLimit: 10,
  providerPaginationPage: 1,
  providerPaginationLimit: 10,
};

export default async function AllocatorReportDetailPage({ params }: PageProps) {
  try {
    const reports = await Promise.all(
      params.report.map((report) =>
        getAllocatorReportById({
          ...reportDefaultParameters,
          allocatorId: params.id,
          reportId: report,
        })
      )
    );

    const reportsSortedByDateAsc = reports.toSorted((reportA, reportB) => {
      const dateA = new Date(reportA.create_date).valueOf();
      const dateB = new Date(reportB.create_date).valueOf();

      return dateA - dateB;
    });

    const fallback = reports.reduce((result, report) => {
      const parameters: GetAllocatorReportByIdParameters = {
        ...reportDefaultParameters,
        allocatorId: params.id,
        reportId: report.id,
      };

      return {
        ...result,
        [unstable_serialize([QueryKey.ALLOCATOR_REPORT_BY_ID, parameters])]:
          report,
      };
    }, {});

    return (
      <SWRConfig
        value={{
          fallback,
        }}
      >
        <ReportsLayout
          allocatorId={params.id}
          reports={reportsSortedByDateAsc}
        />
      </SWRConfig>
    );
  } catch (error) {
    if (isHTTPError(error) && error.status === 404) {
      return notFound();
    }

    throw error;
  }
}
