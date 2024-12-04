import {getClientReportById} from "@/lib/api";
import {IClientReportsResponse} from "@/lib/interfaces/cdp/cdp.interface";

interface IPageProps {
  params: { report: string[], id: string }
}

const ReportDetail = async ({params}: IPageProps) => {

  const reports = await Promise.allSettled(params.report.map(async (report) => getClientReportById(params.id, report)))
  console.log(reports.map(result => (result as PromiseFulfilledResult<IClientReportsResponse>).value))

  return (
    <div>
    </div>
  );
}

export default ReportDetail;