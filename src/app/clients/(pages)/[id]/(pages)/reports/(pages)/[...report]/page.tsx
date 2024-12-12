import {getClientReportById} from "@/lib/api";
import {
  IClientFullReport
} from "@/lib/interfaces/cdp/cdp.interface";
import {ReportsLayout} from "@/app/clients/(pages)/[id]/(pages)/reports/(pages)/[...report]/components/reports-layout";
import {
  ReportsDetailsProvider
} from "@/app/clients/(pages)/[id]/(pages)/reports/(pages)/[...report]/providers/reports-details.provider";
import {parseReports} from "@/app/clients/(pages)/[id]/(pages)/reports/(pages)/[...report]/helpers";

interface IPageProps {
  params: { report: string[], id: string }
}

const ReportDetail = async ({params}: IPageProps) => {

  const reports = await Promise.allSettled(params.report.map(async (report) => getClientReportById(params.id, report)))
  return <ReportsDetailsProvider
    reports={parseReports(reports as PromiseFulfilledResult<IClientFullReport>[])}>
    <ReportsLayout/>
  </ReportsDetailsProvider>
}
export default ReportDetail;