import {
  IAllowanceArray,
  IApiListCountable,
  IApiListResponse,
} from "@/lib/interfaces/dmob/dmob.interface";

export interface IClientsResponse
  extends IApiListResponse<IClient>,
    IApiListCountable {
  totalRemainingDatacap: string;
  clientsWithActiveDeals: string;
  countOfClientsWhoHaveDcAndDeals: string;
  numberOfClients: string;
}

export interface IClient {
  id: number;
  addressId: string;
  address: string;
  retries: number;
  auditTrail: string;
  name: string;
  orgName: string;
  initialAllowance: string;
  allowance: string;
  verifierAddressId: string;
  createdAtHeight: number;
  issueCreateTimestamp: string;
  createMessageTimestamp: number;
  verifierName: string;
  dealCount?: number;
  providerCount?: number;
  topProvider?: string;
  receivedDatacapChange: string;
  usedDatacapChange: string;
  allowanceArray: IAllowanceArray[];
  region: string;
  website: string;
  industry: string;
  remainingDatacap: string;
  receivedDatacapChange90Days: string;
  usedDatacapChange90Days: string;
}

export interface IClientResponse
  extends IApiListResponse<IClientDeal>,
    IApiListCountable {
  name: string;
  allocatedDatacap: string;
  daAllocatedDatacap: string;
  autoverifierAllocatedDatacap: string;
  efilAllocatedDatacap: string;
  ldnAllocatedDatacap: string;
  remainingDatacap: string;
  addressId: string;
}

export interface IClientLatestClaimsResponse
  extends IApiListResponse<IClientLatestClaims> {}

export interface IClientProviderBreakdownResponse {
  stats: IClientProviderBreakdownStat[];
  name: string;
  dealCount: string;
}

export interface IClientProviderBreakdownStat {
  provider: string;
  total_deal_size: string;
  percent: string;
}

export interface IClientDeal {
  id: number;
  type: string;
  clientId: string;
  providerId: string;
  sectorId: string;
  removed: boolean;
  pieceCid: string;
  pieceSize: string;
  termMax: number;
  prevTermMax: string;
  termMin: number;
  termStart: number;
  expiration: string;
  dealId: number;
  isDDO: boolean;
  isMixedSector: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IClientLatestClaims {
  id: string;
  dealId: number;
  clientId: string;
  type: string;
  providerId: string;
  pieceCid: string;
  pieceSize: string;
  createdAt: string;
  idDDO: boolean;
}

export interface IClientAllocationsResponse
  extends IApiListResponse<IClient>,
    IApiListCountable {
  totalRemainingDatacap: string;
  clientsWithActiveDeals: string;
  countOfClientsWhoHaveDcAndDeals: string;
  numberOfClients: string;
}
