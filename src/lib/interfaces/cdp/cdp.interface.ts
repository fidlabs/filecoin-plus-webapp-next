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
  scoreRange: number
  histogram: ICDPHistogram
}

export interface IClientReportHeader {
  id: string
  create_date: string
  client: string
  client_address: string
  organization_name: string
}

export interface IClientReportStorageProviderDistribution {
  client_report_id: string
  provider: string
  total_deal_size: string
  total_deal_percentage: number
  unique_data_size: string
  duplicated_data_size: number
  duplication_percentage: number
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
  unique_data_size: string
  percentage: number
}

export interface IClientReportCIDSharing {
  client: string
  other_client: string
  total_deal_size: string
  unique_cid_count: number
}

export interface IClientFullReport extends IClientReportHeader {
  storage_provider_distribution: IClientReportStorageProviderDistribution[]
  replica_distribution: IClientReportReplicaDistribution[]
  cid_sharing: IClientReportCIDSharing[]
}

export type IClientReportsResponse = IClientReportHeader[]