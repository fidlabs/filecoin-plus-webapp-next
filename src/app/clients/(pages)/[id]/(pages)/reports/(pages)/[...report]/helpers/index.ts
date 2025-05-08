import {
  CompareType,
  IClientFullReport,
  IClientReportCIDSharing,
  IClientReportReplicaDistribution,
  IClientReportStorageProviderDistribution,
} from "@/lib/interfaces/cdp/cdp.interface";
import { uniq } from "lodash";

export const parseProviderDistribution = (
  providerDistribution: IClientReportStorageProviderDistribution[]
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
  result: PromiseFulfilledResult<IClientFullReport>,
  allProviders: IClientReportStorageProviderDistribution[],
  allReplikas: IClientReportReplicaDistribution[],
  allCidShares: IClientReportCIDSharing[]
) => {
  const value = result.value;
  value.storage_provider_distribution = parseProviderDistribution([
    ...allProviders.filter(
      (provider) =>
        !value.storage_provider_distribution.find(
          (p) => p.provider === provider.provider
        )
    ),
    ...value.storage_provider_distribution,
  ]);

  value.replica_distribution = [
    ...allReplikas.filter(
      (replica) =>
        !value.replica_distribution.find(
          (r) => r.num_of_replicas === replica.num_of_replicas
        )
    ),
    ...value.replica_distribution,
  ].sort((a, b) => +a.num_of_replicas - +b.num_of_replicas);

  value.cid_sharing = [
    ...allCidShares.filter(
      (cidShare) =>
        !value.cid_sharing.find((c) => c.other_client === cidShare.other_client)
    ),
    ...value.cid_sharing,
  ].sort((a, b) => a.other_client.localeCompare(b.other_client));

  return value;
};

export const compareReports = (reports: IClientFullReport[]) => {
  if (reports.length < 2) {
    return reports;
  }

  return reports.map((report, index) => {
    if (index === 0) {
      return report;
    }
    return {
      ...report,
      storage_provider_distribution: report.storage_provider_distribution.map(
        (provider, providerIndex) => {
          return {
            ...provider,
            total_deal_size_compare: compare(
              +provider.total_deal_size,
              +reports[index - 1].storage_provider_distribution[providerIndex]
                .total_deal_size
            ),
            total_deal_percentage_compare: compare(
              provider.total_deal_percentage,
              reports[index - 1].storage_provider_distribution[providerIndex]
                .total_deal_percentage
            ),
            unique_data_size_compare: compare(
              +provider.unique_data_size,
              +reports[index - 1].storage_provider_distribution[providerIndex]
                .unique_data_size
            ),
            duplicated_data_size_compare: compare(
              +provider.duplicated_data_size,
              +reports[index - 1].storage_provider_distribution[providerIndex]
                .duplicated_data_size
            ),
            duplication_percentage_compare: compare(
              provider.duplication_percentage,
              reports[index - 1].storage_provider_distribution[providerIndex]
                .duplication_percentage
            ),
            retrievability_success_rate_compare: compare(
              +provider.retrievability_success_rate,
              +reports[index - 1].storage_provider_distribution[providerIndex]
                .retrievability_success_rate
            ),
            retrievability_success_rate_http_compare: compare(
              +provider.retrievability_success_rate_http,
              +reports[index - 1].storage_provider_distribution[providerIndex]
                .retrievability_success_rate_http
            ),
          };
        }
      ),
      replica_distribution: report.replica_distribution.map(
        (replica, replicaIndex) => {
          return {
            ...replica,
            total_deal_size_compare: compare(
              +replica.total_deal_size,
              +reports[index - 1].replica_distribution[replicaIndex]
                .total_deal_size
            ),
            unique_data_size_compare: compare(
              +replica.unique_data_size,
              +reports[index - 1].replica_distribution[replicaIndex]
                .unique_data_size
            ),
            percentage_compare: compare(
              replica.percentage,
              reports[index - 1].replica_distribution[replicaIndex].percentage
            ),
          };
        }
      ),
      cid_sharing: report.cid_sharing.map((cidShare, cidShareIndex) => {
        return {
          ...cidShare,
          total_deal_size_compare: compare(
            +cidShare.total_deal_size,
            +reports[index - 1].cid_sharing[cidShareIndex].total_deal_size
          ),
          unique_cid_count_compare: compare(
            cidShare.unique_cid_count,
            reports[index - 1].cid_sharing[cidShareIndex].unique_cid_count
          ),
        };
      }),
    };
  });
};

const compare = (value: number, compareValue: number) => {
  if (value === compareValue) {
    return "equal" as CompareType;
  }
  if (value < compareValue) {
    return "down" as CompareType;
  } else {
    return "up" as CompareType;
  }
};

export const prepareEmptyProviders = (allProviders: string[]) => {
  return uniq(allProviders).map(
    (provider) =>
      ({
        not_found: true,
        total_deal_size: "0",
        total_deal_percentage: 0,
        unique_data_size: "0",
        duplicated_data_size: 0,
        duplication_percentage: 0,
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
      }) as IClientReportStorageProviderDistribution
  );
};

export const prepareEmptyReplicas = (allReplicas: string[]) => {
  return uniq(allReplicas).map(
    (num) =>
      ({
        not_found: true,
        client_report_id: "",
        num_of_replicas: num,
        percentage: 0,
        total_deal_size: "0",
        unique_data_size: "0",
      }) as IClientReportReplicaDistribution
  );
};

export const prepareEmptyCIDSharing = (allCidShares: string[]) => {
  return uniq(allCidShares).map(
    (other_client) =>
      ({
        client: "",
        not_found: true,
        other_client,
        total_deal_size: "0",
        unique_cid_count: 0,
      }) as IClientReportCIDSharing
  );
};

export const parseReports = (
  reports: PromiseFulfilledResult<IClientFullReport>[]
) => {
  const allProviders = prepareEmptyProviders(
    reports
      .map((report) =>
        report.value.storage_provider_distribution.map(
          (provider) => provider.provider
        )
      )
      .flat()
  );
  const allReplikas = prepareEmptyReplicas(
    reports
      .map((report) =>
        report.value.replica_distribution.map(
          (provider) => provider.num_of_replicas
        )
      )
      .flat()
  );
  const allCidShares = prepareEmptyCIDSharing(
    reports
      .map((report) =>
        report.value.cid_sharing.map((provider) => provider.other_client)
      )
      .flat()
  );
  const richReports = reports.map((report) =>
    parseReport(report, allProviders, allReplikas, allCidShares)
  );
  return compareReports(richReports);
};
