export interface IFilPlusStats {
  totalDcStored: string;
  countOfClientsWhoUsedMoreThan90PercentOfRequestedDatacap: string;
  countOfClientsWhoReceiveMoreThan100TibDatacap: string;
  numberOfNotaries: string;
  LDNnumberOfNotaries: string;
  numberOfClients: string;
  numberOfDeals: string;
  numberOfProviders: string;
  amountOfData: string;
  totalAmountOfDatacapGrantedToNotaries: string;
  totalAmountOfDatacapGrantedToLDNNotaries: string;
  totalAmountOfDatacapRequestedAndApprovedByGovTeam: string;
  LDNtotalAmountOfDatacapUsedByClients: string;
  totalAmountOfDatacapUsedByClients: string;
  TTD: string;
  avgTTDIn95thPercentile: string;
  totalAmountOfDatacapGrantedToClients: string;
  LDNtotalAmountOfDatacapGrantedToClients: string;
  numberOfActiveNotaries: string;
  numberOfSpProviders: string;
  activeVerifiedDealCollateral: string;
  activeRegularDealCollateral: string;
  totalVerifiedDealCollateral: string;
  totalRegularDealCollateral: string;
  percentOfAllocatedDatacapFromTotal: string;
  percentOfUsedDataFromDatacapGrantedToNotaries: string;
  percentOfUsedDataFromDatacapGrantedToClients: string;
  LDNv3totalAmountOfDatacapGrantedToNotary: string;
  LDNv3totalAmountOfDatacapGrantedToClients: string;
  LDNv3totalAmountOfDatacapUsedByClients: string;
  LDNv3percentOfAllocatedDatacapFromTotal: string;
  LDNv3percentOfUsedDataFromDatacapGrantedToClients: string;
  LDNv3percentOfUsedDataFromDatacapGrantedToNotaries: string;
  EFilTotalAmountOfDatacapGrantedToNotary: string;
  EFilTotalAmountOfDatacapGrantedToClients: string;
  EFiltotalAmountOfDatacapUsedByClients: string;
  EFilPercentOfAllocatedDatacapFromTotal: string;
  EFilPercentOfUsedDataFromDatacapGrantedToClients: string;
  EFilPercentOfUsedDataFromDatacapGrantedToNotaries: string;
  numberOfMainlyFilPlusProviders: string;
  totalNumberOfProviders: string;
  investmentCost: string;
  totalNewInitialPledge: string;
  sankeyChartData: string;
  totalDcStoredDealsV2: string;
  totalDcStoredClaims: string;
  numberOfActiveNotariesV2: string;
  numberOfAllocators: string;
  totalDcGivenToAllocators: string;
  totalDcUsedByAllocators: string;
}

export interface IFilDCFLow {
  rkh: {
    inactiveAllocators: IFilDCFLowAllocators;
    activeAllocators: IFilDCFLowActiveAllocators;
  };
}

export interface IFilDCFLowActiveAllocators {
  passedAudit: IFilDCFLowAllocators;
  passedAuditConditionally: IFilDCFLowAllocators;
  failedAudit: IFilDCFLowAllocators;
  notAudited: IFilDCFLowAllocators;
}

export interface IFilDCFLowAllocators {
  totalDc: string;
  allocators: IFilDCFLowAllocator[];
}

export interface IFilDCFLowAllocator {
  addressId: string;
  name?: string;
  orgName?: string;
  datacap: string;
}

export interface IFilDCAllocationsWeekly {
  [key: PropertyKey]: {
    [key: PropertyKey]: number;
  };
}

export interface IFilDCAllocationsWeeklyByClient {
  [key: PropertyKey]: {
    [key: PropertyKey]: {
      [key: PropertyKey]: string;
    };
  };
}

export interface IApiListResponse<T> {
  data: T[];
}

export interface IApiListCountable {
  count: string;
}

export interface IAllowanceArray {
  id: number;
  error: string;
  height: number;
  msgCID: string;
  retries: number;
  addressId: string;
  allowance: string;
  auditTrail: string;
  allowanceTTD?: number;
  isDataPublic: string;
  issueCreator: string;
  usedAllowance: string;
  isLdnAllowance: boolean;
  isEFilAllowance: boolean;
  verifierAddressId: string;
  isFromAutoverifier: boolean;
  retrievalFrequency: string;
  searchedByProposal: boolean;
  issueCreateTimestamp: number;
  hasRemainingAllowance: boolean;
  createMessageTimestamp: number;
}
