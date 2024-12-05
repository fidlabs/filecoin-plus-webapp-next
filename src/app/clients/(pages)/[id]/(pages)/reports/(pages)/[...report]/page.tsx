import {getClientReportById} from "@/lib/api";
import {IClientFullReport, IClientReportStorageProviderDistribution} from "@/lib/interfaces/cdp/cdp.interface";
import {ReportsLayout} from "@/app/clients/(pages)/[id]/(pages)/reports/(pages)/[...report]/components/reports-layout";
import {
  ReportsDetailsProvider
} from "@/app/clients/(pages)/[id]/(pages)/reports/(pages)/[...report]/components/reports-details.provider";

interface IPageProps {
  params: { report: string[], id: string }
}

const parseProviderDistribution = (providerDistribution: IClientReportStorageProviderDistribution[]) => {
  const allDealSize = providerDistribution.reduce((acc, provider) => acc + +provider.total_deal_size, 0)
  return providerDistribution.map((provider) => ({
    ...provider,
    total_deal_percentage: +provider.total_deal_size / allDealSize * 100,
    duplication_percentage: (+provider.total_deal_size - +provider.unique_data_size) / +provider.total_deal_size * 100,
    duplicated_data_size: +provider.total_deal_size - +provider.unique_data_size,
  }));
}

const parseReport = (result: PromiseFulfilledResult<IClientFullReport>) => {
  const value = result.value;
  value.storage_provider_distribution = parseProviderDistribution(value.storage_provider_distribution)
  return value
}

const ReportDetail = async ({params}: IPageProps) => {

  const reports = await Promise.allSettled(params.report.map(async (report) => getClientReportById(params.id, report)))

  return <ReportsDetailsProvider
    reports={reports.map(result => parseReport(result as PromiseFulfilledResult<IClientFullReport>))}>
    <ReportsLayout/>
  </ReportsDetailsProvider>
}
export default ReportDetail;