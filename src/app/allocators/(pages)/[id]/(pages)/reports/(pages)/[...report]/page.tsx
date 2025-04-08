import { getAllocatorReportById } from "@/lib/api";
import { ICDPAllocatorFullReport } from "@/lib/interfaces/cdp/cdp.interface";
import { ReportsLayout } from "@/app/allocators/(pages)/[id]/(pages)/reports/(pages)/[...report]/components/reports-layout";
import { ReportsDetailsProvider } from "@/app/allocators/(pages)/[id]/(pages)/reports/(pages)/[...report]/providers/reports-details.provider";
import { parseReports } from "@/app/allocators/(pages)/[id]/(pages)/reports/(pages)/[...report]/helpers";

interface IPageProps {
  params: { report: string[]; id: string };
}

const ReportDetail = async ({ params }: IPageProps) => {
  const reports = await Promise.allSettled(
    params.report.map(async (report) =>
      getAllocatorReportById(params.id, report)
    )
  );
  return (
    <ReportsDetailsProvider
      reports={parseReports(
        reports as PromiseFulfilledResult<ICDPAllocatorFullReport>[]
      )}
    >
      <ReportsLayout />
    </ReportsDetailsProvider>
  );
};
export default ReportDetail;
