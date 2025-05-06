export interface ICDPHistogramResult {
  averageSuccessRate: number | undefined;
  histogram: ICDPHistogram;
}

export interface ICDPHistogram {
  total: number;
  results: ICDPWeek[];
}

export interface ICDPWeek {
  week: string;
  results: ICDPRange[];
  total: number;
  averageSuccessRate?: number;
}

export interface ICDPRange {
  valueFromExclusive: number;
  valueToInclusive: number;
  count: number;
  totalDatacap: number;
}

export interface ICDPUnifiedHistogram {
  avgSuccessRatePct: number;
  count: number;
  buckets: ICDPWeek[];
}

export interface IAllocatorSPSComplainceResult {
  results: IAllocatorSPSComplianceRange[];
}

export interface IAllocatorSPSComplianceRange {
  week: string;
  allocators: IAllocatorSPSComplianceAllocator[];
  total: number;
}

export interface IAllocatorSPSComplianceAllocator {
  id: string;
  compliantSpsPercentage?: number;
  partiallyCompliantSpsPercentage?: number;
  nonCompliantSpsPercentage?: number;
}

export interface IClientReportHeader {
  id: string;
  create_date: string;
  client: string;
  client_address: string;
  organization_name: string;
  application_url: string;
}

export type CompareType = "up" | "down" | "equal" | undefined;

export type IPNIReportingStatus = "MISREPORTING" | "NOT_REPORTING" | "OK";

export interface IClientReportStorageProviderDistribution {
  not_found: boolean | undefined;
  client_report_id: string;
  provider: string;
  total_deal_size: string;
  total_deal_size_compare: CompareType;
  total_deal_percentage: number;
  total_deal_percentage_compare: CompareType;
  unique_data_size: string;
  unique_data_size_compare: CompareType;
  duplicated_data_size: number;
  duplicated_data_size_compare: CompareType;
  duplication_percentage: number;
  duplication_percentage_compare: CompareType;
  retrievability_success_rate: string;
  retrievability_success_rate_http: string;
  retrievability_success_rate_compare: CompareType;
  ipni_reporting_status: IPNIReportingStatus;
  ipni_reported_claims_count: string | undefined;
  claims_count: string | undefined;
  location: IGenericReportLocation;
}

export interface IGenericReportLocation {
  ip: string;
  city: string;
  region: string;
  country: string;
  loc: string;
  org: string;
  postal: string;
  timezone: string;
  hostname?: string;
  provider_distribution_id: string;
}

export interface IClientReportReplicaDistribution {
  client_report_id: string;
  num_of_replicas: string;
  total_deal_size: string;
  total_deal_size_compare: CompareType;
  unique_data_size: string;
  unique_data_size_compare: CompareType;
  percentage: number;
  percentage_compare: CompareType;
  not_found: boolean | undefined;
}

export interface IClientReportCIDSharing {
  not_found: boolean | undefined;
  client: string;
  other_client: string;
  total_deal_size: string;
  total_deal_size_compare: CompareType;
  unique_cid_count: number;
  unique_cid_count_compare: CompareType;
}

export enum ClientReportCheckType {
  STORAGE_PROVIDER_DISTRIBUTION_ALL_LOCATED_IN_THE_SAME_REGION = "STORAGE_PROVIDER_DISTRIBUTION_ALL_LOCATED_IN_THE_SAME_REGION",
  STORAGE_PROVIDER_DISTRIBUTION_PROVIDERS_EXCEED_PROVIDER_DEAL = "STORAGE_PROVIDER_DISTRIBUTION_PROVIDERS_EXCEED_PROVIDER_DEAL",
  STORAGE_PROVIDER_DISTRIBUTION_PROVIDERS_EXCEED_MAX_DUPLICATION = "STORAGE_PROVIDER_DISTRIBUTION_PROVIDERS_EXCEED_MAX_DUPLICATION",
  STORAGE_PROVIDER_DISTRIBUTION_PROVIDERS_UNKNOWN_LOCATION = "STORAGE_PROVIDER_DISTRIBUTION_PROVIDERS_UNKNOWN_LOCATION",
  STORAGE_PROVIDER_DISTRIBUTION_PROVIDERS_RETRIEVABILITY_ZERO = "STORAGE_PROVIDER_DISTRIBUTION_PROVIDERS_RETRIEVABILITY_ZERO",
  STORAGE_PROVIDER_DISTRIBUTION_PROVIDERS_RETRIEVABILITY_75 = "STORAGE_PROVIDER_DISTRIBUTION_PROVIDERS_RETRIEVABILITY_75",
  DEAL_DATA_REPLICATION_LOW_REPLICA = "DEAL_DATA_REPLICATION_LOW_REPLICA",
  DEAL_DATA_REPLICATION_CID_SHARING = "DEAL_DATA_REPLICATION_CID_SHARING",
  STORAGE_PROVIDER_DISTRIBUTION_PROVIDERS_IPNI_MISREPORTING = "STORAGE_PROVIDER_DISTRIBUTION_PROVIDERS_IPNI_MISREPORTING",
  STORAGE_PROVIDER_DISTRIBUTION_PROVIDERS_IPNI_NOT_REPORTING = "STORAGE_PROVIDER_DISTRIBUTION_PROVIDERS_IPNI_NOT_REPORTING",
  MULTIPLE_ALLOCATORS = "MULTIPLE_ALLOCATORS",
  NOT_ENOUGH_COPIES = "NOT_ENOUGH_COPIES",
}

type ClientReportCheckBase<
  T extends string,
  M extends Record<string, unknown> = Record<string, never>,
> = {
  check: T;
  result: boolean;
  metadata: M & {
    msg: string;
  };
};

export type ClientReportStorageProviderDistributionAllLocatedInTheSameRegionCheck =
  ClientReportCheckBase<ClientReportCheckType.STORAGE_PROVIDER_DISTRIBUTION_ALL_LOCATED_IN_THE_SAME_REGION>;

export type ClientReportStorageProviderDistributionProvidersExceedProviderDealCheck =
  ClientReportCheckBase<
    ClientReportCheckType.STORAGE_PROVIDER_DISTRIBUTION_PROVIDERS_EXCEED_PROVIDER_DEAL,
    {
      violating_ids: string[];
      max_provider_deal_percentage: `${number}`;
      providers_exceeding_provider_deal: number;
      max_providers_exceeding_provider_deal: number;
    }
  >;

export type ClientReportStorageProviderDistributionProvidersExceedMaxDuplicationCheck =
  ClientReportCheckBase<ClientReportCheckType.STORAGE_PROVIDER_DISTRIBUTION_PROVIDERS_EXCEED_MAX_DUPLICATION>;

export type ClientReportStorageProviderDistributionProvidersUnknownLocationCheck =
  ClientReportCheckBase<ClientReportCheckType.STORAGE_PROVIDER_DISTRIBUTION_PROVIDERS_UNKNOWN_LOCATION>;

export type ClientReportStorageProviderDistributionProvidersRetrievabilityZeroCheck =
  ClientReportCheckBase<
    ClientReportCheckType.STORAGE_PROVIDER_DISTRIBUTION_PROVIDERS_RETRIEVABILITY_ZERO,
    {
      percentage: number;
      zero_retrievability_providers: number;
      max_zero_retrievability_providers: number;
    }
  >;

export type ClientReportStorageProviderDistributionProvidersRetrievability75Check =
  ClientReportCheckBase<
    ClientReportCheckType.STORAGE_PROVIDER_DISTRIBUTION_PROVIDERS_RETRIEVABILITY_75,
    {
      percentage: number;
      less_than_75_retrievability_providers: number;
      max_less_than_75_retrievability_providers: number;
    }
  >;

export type ClientReportDealDataReplicationLowReplicaCheck =
  ClientReportCheckBase<
    ClientReportCheckType.DEAL_DATA_REPLICATION_LOW_REPLICA,
    {
      percentage: number;
      max_percentage_for_low_replica: `${number}`;
    }
  >;

export type ClientReportDealDataReplicationCIDSharingCheck =
  ClientReportCheckBase<
    ClientReportCheckType.DEAL_DATA_REPLICATION_LOW_REPLICA,
    {
      count: number;
    }
  >;

export type ClientReportStorageProviderDistributionProvidersIPNIMisreportingCheck =
  ClientReportCheckBase<ClientReportCheckType.STORAGE_PROVIDER_DISTRIBUTION_PROVIDERS_IPNI_MISREPORTING>;

export type ClientReportStorageProviderDistributionProvidersIPNINotReportingCheck =
  ClientReportCheckBase<
    ClientReportCheckType.STORAGE_PROVIDER_DISTRIBUTION_PROVIDERS_IPNI_NOT_REPORTING,
    {
      percentage: number;
      violating_ids: string[];
      not_reporting_providers: number;
      max_not_reporting_providers: number;
    }
  >;

export type ClientReportMultipleAllocatorsCheck = ClientReportCheckBase<
  ClientReportCheckType.MULTIPLE_ALLOCATORS,
  {
    allocators_count: number;
    max_allocators_count: number;
  }
>;

export type ClientReportNotEnoughCopiesCheck = ClientReportCheckBase<
  ClientReportCheckType.NOT_ENOUGH_COPIES,
  {
    percentage: number;
    max_percentage_for_required_copies: `${number}`;
  }
>;

export type ClientReportCheck =
  | ClientReportStorageProviderDistributionAllLocatedInTheSameRegionCheck
  | ClientReportStorageProviderDistributionProvidersExceedProviderDealCheck
  | ClientReportStorageProviderDistributionProvidersExceedMaxDuplicationCheck
  | ClientReportStorageProviderDistributionProvidersUnknownLocationCheck
  | ClientReportStorageProviderDistributionProvidersRetrievabilityZeroCheck
  | ClientReportStorageProviderDistributionProvidersRetrievability75Check
  | ClientReportDealDataReplicationLowReplicaCheck
  | ClientReportDealDataReplicationCIDSharingCheck
  | ClientReportStorageProviderDistributionProvidersIPNIMisreportingCheck
  | ClientReportMultipleAllocatorsCheck
  | ClientReportNotEnoughCopiesCheck;

export interface IClientFullReport extends IClientReportHeader {
  storage_provider_distribution: IClientReportStorageProviderDistribution[];
  replica_distribution: IClientReportReplicaDistribution[];
  cid_sharing: IClientReportCIDSharing[];
  check_results: ClientReportCheck[];
}

export type IClientReportsResponse = IClientReportHeader[];

export interface AllocatorClientMultipleAllocatorsCheckResult {
  check: "CLIENT_MULTIPLE_ALLOCATORS";
  result: boolean;
  metadata: {
    msg: string;
    violating_ids: string[];
    clients_using_multiple_allocators_count: number;
    max_clients_using_multiple_allocators_count: number;
  };
}

export type AllocatorCheckResult = AllocatorClientMultipleAllocatorsCheckResult;

export interface ICDPAllocatorFullReport {
  id: string;
  create_date: string;
  allocator: string;
  name: string;
  address: string;
  clients_number: number;
  multisig: boolean;
  avg_retrievability_success_rate: number;
  data_types: string[];
  required_copies: string;
  required_sps: string;
  clients: ICDPAllocatorFullReportClient[];
  storage_provider_distribution: ICDPAllocatorFullReportStorageProviderDistribution[];
  check_results: Array<AllocatorCheckResult>;
}

export interface ICDPAllocatorFullReportClient {
  not_found: boolean | undefined;
  client_id: string;
  name: string;
  allocations_number: number;
  total_allocations: string;
  application_url: string;
  application_timestamp: string;
  allocations: ICDPAllocatorFullReportClientAllocation[];
}

export interface ICDPAllocatorFullReportClientAllocation {
  allocation: string;
  timestamp: string;
}

export interface ICDPAllocatorFullReportStorageProviderDistribution {
  not_found: boolean | undefined;
  provider: string;
  total_deal_size: string;
  total_deal_size_compare: CompareType;
  unique_data_size: string;
  unique_data_size_compare: CompareType;
  perc_of_total_datacap: number;
  perc_of_total_datacap_compare: CompareType;
  retrievability_success_rate?: number;
  retrievability_success_rate_compare: CompareType;
  location: IGenericReportLocation;
}

export interface ICDPAgregatedIPNIReport {
  misreporting: number;
  notReporting: number;
  ok: number;
  total: number;
}

export interface CDPProvidersComplianceData {
  averageSuccessRate: number;
  results: Array<{
    /** ISO8601 */
    week: string;
    averageSuccessRate: number;
    compliantSps: number;
    partiallyCompliantSps: number;
    nonCompliantSps: number;
    totalSps: number;
    compliantSpsTotalDatacap: number;
    partiallyCompliantSpsTotalDatacap: number;
    nonCompliantSpsTotalDatacap: number;
  }>;
}

export interface CDPAllocatorsSPsComplianceData {
  averageSuccessRate: number;
  results: Array<{
    /** ISO8601 */
    week: string;
    averageSuccessRate: number;
    allocators: Array<{
      id: string;
      compliantSpsPercentage: number;
      partiallyCompliantSpsPercentage: number;
      nonCompliantSpsPercentage: number;
      totalSps: number;
      totalDatacap: number;
    }>;
  }>;
}

export interface CDPAllocatorsClientsData {
  total: number;
  results: {
    week: string;
    total: number;
    results: {
      valueFromExclusive: number;
      valueToInclusive: number;
      count: number;
      totalDatacap: string;
    }[];
  }[];
}

export interface CPDAggregatedIPNIReport {
  misreporting: number;
  notReporting: number;
  ok: number;
  total: number;
}
