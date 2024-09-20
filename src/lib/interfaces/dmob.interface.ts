export interface IFilPlusStats {
  totalDcStored: string
  countOfClientsWhoUsedMoreThan90PercentOfRequestedDatacap: string
  countOfClientsWhoReceiveMoreThan100TibDatacap: string
  numberOfNotaries: string
  LDNnumberOfNotaries: string
  numberOfClients: string
  numberOfDeals: string
  numberOfProviders: string
  amountOfData: string
  totalAmountOfDatacapGrantedToNotaries: string
  totalAmountOfDatacapGrantedToLDNNotaries: string
  totalAmountOfDatacapRequestedAndApprovedByGovTeam: string
  LDNtotalAmountOfDatacapUsedByClients: string
  totalAmountOfDatacapUsedByClients: string
  TTD: string
  avgTTDIn95thPercentile: string
  totalAmountOfDatacapGrantedToClients: string
  LDNtotalAmountOfDatacapGrantedToClients: string
  numberOfActiveNotaries: string
  numberOfSpProviders: string
  activeVerifiedDealCollateral: string
  activeRegularDealCollateral: string
  totalVerifiedDealCollateral: string
  totalRegularDealCollateral: string
  percentOfAllocatedDatacapFromTotal: string
  percentOfUsedDataFromDatacapGrantedToNotaries: string
  percentOfUsedDataFromDatacapGrantedToClients: string
  LDNv3totalAmountOfDatacapGrantedToNotary: string
  LDNv3totalAmountOfDatacapGrantedToClients: string
  LDNv3totalAmountOfDatacapUsedByClients: string
  LDNv3percentOfAllocatedDatacapFromTotal: string
  LDNv3percentOfUsedDataFromDatacapGrantedToClients: string
  LDNv3percentOfUsedDataFromDatacapGrantedToNotaries: string
  EFilTotalAmountOfDatacapGrantedToNotary: string
  EFilTotalAmountOfDatacapGrantedToClients: string
  EFiltotalAmountOfDatacapUsedByClients: string
  EFilPercentOfAllocatedDatacapFromTotal: string
  EFilPercentOfUsedDataFromDatacapGrantedToClients: string
  EFilPercentOfUsedDataFromDatacapGrantedToNotaries: string
  numberOfMainlyFilPlusProviders: string
  totalNumberOfProviders: string
  investmentCost: string
  totalNewInitialPledge: string
  sankeyChartData: string
  totalDcStoredDealsV2: string
  totalDcStoredClaims: string
  numberOfActiveNotariesV2: string
  numberOfAllocators: string
  totalDcGivenToAllocators: string
  totalDcUsedByAllocators: string
}

export interface IFilDCFLow {
  rkh: {
    inactiveAllocators: IFilDCFLowAllocators
    activeAllocators: IFilDCFLowActiveAllocators
  }
}

export interface IFilDCFLowActiveAllocators {
  passedAudit: IFilDCFLowAllocators
  passedAuditConditionally: IFilDCFLowAllocators
  failedAudit: IFilDCFLowAllocators
  notAudited: IFilDCFLowAllocators
}

export interface IFilDCFLowAllocators {
  totalDc: string
  allocators: IFilDCFLowAllocator[]
}

export interface IFilDCFLowAllocator {
  addressId: string
  name?: string
  orgName?: string
  datacap: string
}

export interface IFilDCAllocationsWeekly {
  [key: PropertyKey]: {
    [key: PropertyKey]: number
  }
}

export interface IFilDCAllocationsWeeklyByClient {
  [key: PropertyKey]: {
    [key: PropertyKey]: {
      [key: PropertyKey]: string
    }
  }
}

export interface IApiListResponse<T> {
  data: T[]
}

export interface IApiListCountable {
  count: string
}

export interface IAllocatorsResponse extends IApiListResponse<IAllocator>, IApiListCountable {}

export interface IAllocatorResponse extends IApiListResponse<IClient>, IApiListCountable{
  name: string
  remainingDatacap: string
  addressId: string
  address: string
}

export interface IAllocator {
  id: number
  addressId: string
  address: string
  auditTrail: string
  retries: number
  name?: string
  orgName?: string
  removed: boolean
  initialAllowance: string
  allowance: string
  inffered: boolean
  isMultisig: boolean
  createdAtHeight: number
  issueCreateTimestamp?: number
  createMessageTimestamp: number
  verifiedClientsCount: number
  receivedDatacapChange: string
  allowanceArray: IAllowanceArray[]
  auditStatus?: string
  remainingDatacap: string
}

export interface IClientsResponse extends IApiListResponse<IClient>, IApiListCountable {
  totalRemainingDatacap: string
  clientsWithActiveDeals: string
  countOfClientsWhoHaveDcAndDeals: string
  numberOfClients: string
}

export interface IClient {
  id: number
  addressId: string
  address: string
  retries: number
  auditTrail: string
  name: string
  orgName: string
  initialAllowance: string
  allowance: string
  verifierAddressId: string
  createdAtHeight: number
  issueCreateTimestamp: string
  createMessageTimestamp: number
  verifierName: string
  dealCount?: number
  providerCount?: number
  topProvider?: string
  receivedDatacapChange: string
  usedDatacapChange: string
  allowanceArray: IAllowanceArray[]
  region: string
  website: string
  industry: string
  remainingDatacap: string
}

export interface IAllowanceArray {
  id: number
  error: string
  height: number
  msgCID: string
  retries: number
  addressId: string
  allowance: string
  auditTrail?: string
  verifierId: number
  issueCreateTimestamp?: number
  createMessageTimestamp: number
}

export interface IStorageProvidersResponse extends IApiListResponse<IStorageProvider>, IApiListCountable {}

export interface IStorageProvider {
  provider: string
  noOfVerifiedDeals: number
  verifiedDealsTotalSize: string
  noOfClients: number
  lastDealHeight: string
}

export interface IStorageProviderResponse extends IApiListResponse<IVerifiedClient>, IApiListCountable {
  providerId: string
}

export interface IVerifiedClient {
  no_of_deals: string
  concat: string
  lastdealstart: number
}