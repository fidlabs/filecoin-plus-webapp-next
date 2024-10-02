import {IApiListCountable, IApiListResponse} from "@/lib/interfaces/dmob/dmob.interface";

export interface IStorageProvidersResponse extends IApiListResponse<IStorageProvider>, IApiListCountable {}

export interface IStorageProvider {
  provider: string
  noOfVerifiedDeals: number
  verifiedDealsTotalSize: string
  noOfClients: number
  lastDealHeight: string
}

export interface IStorageProviderResponse extends IApiListResponse<IStorageProviderClient>, IApiListCountable {
  providerId: string
}

export interface IStorageProviderClient {
  client: string
  provider: string
  noOfVerifiedDeals: number
  verifiedDealsTotalSize: string
  lastDealHeight: number
}