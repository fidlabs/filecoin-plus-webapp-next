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

export interface ICLientFullreport extends IClientReportHeader {

}

export type IClientReportsResponse = IClientReportHeader[]