import { compareReportValue } from "@/lib/helpers/cpd.helpers";
import {
  AllocatorFullReportNotFoundClient,
  ICDPAllocatorFullReport,
  ICDPAllocatorFullReportClient,
  ICDPAllocatorFullReportStorageProviderDistribution,
} from "@/lib/interfaces/cdp/cdp.interface";
import { uniq } from "lodash";

export const parseProviderDistribution = (
  providerDistribution: ICDPAllocatorFullReportStorageProviderDistribution[]
) => {
  const allDealSize = providerDistribution.reduce(
    (acc, provider) => acc + +provider.total_deal_size,
    0
  );
  return providerDistribution
    .sort((a, b) => a.provider.localeCompare(b.provider))
    .map((provider) => ({
      ...provider,
      total_deal_percentage: (+provider.total_deal_size / allDealSize) * 100,
      duplication_percentage:
        ((+provider.total_deal_size - +provider.unique_data_size) /
          +provider.total_deal_size) *
        100,
      duplicated_data_size:
        +provider.total_deal_size - +provider.unique_data_size,
    }));
};

export const parseReport = (
  report: ICDPAllocatorFullReport,
  allCLients: ICDPAllocatorFullReportClient[],
  allProviders: ICDPAllocatorFullReportStorageProviderDistribution[]
): ICDPAllocatorFullReport => {
  report.storage_provider_distribution.data = parseProviderDistribution([
    ...allProviders.filter(
      (provider) =>
        !report.storage_provider_distribution.data.find(
          (p) => p.provider === provider.provider
        )
    ),
    ...report.storage_provider_distribution.data,
  ]);

  report.clients.data = [
    ...allCLients.filter(
      (client) =>
        !report.clients.data.find((c) => c.client_id === client.client_id)
    ),
    ...report.clients.data,
  ].sort((a, b) => a.client_id.localeCompare(b.client_id));

  return report;
};

export const compareReports = (reports: ICDPAllocatorFullReport[]) => {
  if (reports.length < 2) {
    return reports;
  }

  return reports.map((report, index) => {
    if (index === 0) {
      return report;
    }
    return {
      ...report,
      storage_provider_distribution: {
        data: report.storage_provider_distribution.data.map(
          (provider, providerIndex) => {
            return {
              ...provider,
              total_deal_size_compare: compareReportValue(
                +provider.total_deal_size,
                +reports[index - 1].storage_provider_distribution.data[
                  providerIndex
                ].total_deal_size
              ),
              unique_data_size_compare: compareReportValue(
                +provider.unique_data_size,
                +reports[index - 1].storage_provider_distribution.data[
                  providerIndex
                ].unique_data_size
              ),
              perc_of_total_datacap_compare: compareReportValue(
                +provider.perc_of_total_datacap,
                +reports[index - 1].storage_provider_distribution.data[
                  providerIndex
                ].perc_of_total_datacap
              ),
            };
          }
        ),
      },
    };
  });
};

export const prepareEmptyProviders = (allProviders: string[]) => {
  return uniq(allProviders).map(
    (provider) =>
      ({
        not_found: true,
        total_deal_size: "0",
        unique_data_size: "0",
        perc_of_total_datacap: 0,
        retrievability_success_rate: 0,
        retrievability_success_rate_http: 0,
        retrievability_success_rate_url_finder: 0,
        provider,
        location: {
          city: "",
          country: "",
          ip: "",
          loc: "",
          org: "",
          postal: "",
          provider_distribution_id: "",
          region: "",
          timezone: "",
        },
      }) as ICDPAllocatorFullReportStorageProviderDistribution
  );
};

export const prepareEmptyClients = (allClients: string[]) => {
  return uniq(allClients).map(
    (client_id) =>
      ({
        client_id,
        not_found: true,
        name: "",
        allocations_number: 0,
        total_allocations: "",
        application_url: "",
        application_timestamp: "",
      }) as AllocatorFullReportNotFoundClient
  );
};

export const parseReports = (reports: ICDPAllocatorFullReport[]) => {
  const allClients = prepareEmptyClients(
    reports
      .map((report) => report.clients.data.map((client) => client.client_id))
      .flat()
  );

  const allProviders = prepareEmptyProviders(
    reports
      .map((report) =>
        report.storage_provider_distribution.data.map(
          (provider) => provider.provider
        )
      )
      .flat()
  );

  const richReports = reports.map((report) =>
    parseReport(report, allClients, allProviders)
  );

  return compareReports(richReports);
};
