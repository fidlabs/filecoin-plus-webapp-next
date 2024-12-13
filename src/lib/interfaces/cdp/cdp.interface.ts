export interface ICDPHistogramResult {
  averageSuccessRate: number | undefined
  histogram: ICDPHistogram
}

export interface ICDPHistogram {
  total: number
  results: ICDPWeek[]
}

export interface ICDPWeek {
  week: string
  results: ICDPRange[]
  total: number
}

export interface ICDPRange {
  valueFromExclusive: number
  valueToInclusive: number
  count: number
}

export interface ICDPUnifiedHistogram {
  avgSuccessRatePct: number
  count: number
  buckets: ICDPWeek[]
}


export interface IAllocatorSPSComplainceResult {
  results: IAllocatorSPSComplianceRange[]
}

export interface IAllocatorSPSComplianceRange {
  week: string
  allocators: IAllocatorSPSComplianceAllocator[]
  total: number
}

export interface IAllocatorSPSComplianceAllocator {
  id: string
  compliantSpsPercentage?: number
  partiallyCompliantSpsPercentage?: number
  nonCompliantSpsPercentage?: number
}

export interface IClientReportHeader {
  id: string
  create_date: string
  client: string
  client_address: string
  organization_name: string
}

export type CompareType = "up" | "down" | "equal" | undefined

export interface IClientReportStorageProviderDistribution {
  not_found: boolean | undefined
  client_report_id: string
  provider: string
  total_deal_size: string
  total_deal_size_compare: CompareType
  total_deal_percentage: number
  total_deal_percentage_compare: CompareType
  unique_data_size: string
  unique_data_size_compare: CompareType
  duplicated_data_size: number
  duplicated_data_size_compare: CompareType
  duplication_percentage: number
  duplication_percentage_compare: CompareType
  location: IClientReportLocation
}

export interface IClientReportLocation {
  ip: string
  city: string
  region: string
  country: string
  loc: string
  org: string
  postal: string
  timezone: string
  hostname?: string
  provider_distribution_id: string
}

export interface IClientReportReplicaDistribution {
  client_report_id: string
  num_of_replicas: string
  total_deal_size: string
  total_deal_size_compare: CompareType
  unique_data_size: string
  unique_data_size_compare: CompareType
  percentage: number
  percentage_compare: CompareType
  not_found: boolean | undefined
}

export interface IClientReportCIDSharing {
  not_found: boolean | undefined
  client: string
  other_client: string
  total_deal_size: string
  total_deal_size_compare: CompareType
  unique_cid_count: number
  unique_cid_count_compare: CompareType
}

export interface IClientFullReport extends IClientReportHeader {
  storage_provider_distribution: IClientReportStorageProviderDistribution[]
  replica_distribution: IClientReportReplicaDistribution[]
  cid_sharing: IClientReportCIDSharing[]
}

export type IClientReportsResponse = IClientReportHeader[]