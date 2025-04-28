import { IApiListResponse } from "@/lib/interfaces/dmob/dmob.interface";

export interface IStorageProvidersResponse
  extends IApiListResponse<IStorageProvider> {
  count: number;
}

export interface IStorageProvider {
  provider: string;
  noOfVerifiedDeals: number;
  verifiedDealsTotalSize: string;
  noOfClients: number;
  lastDealHeight: number;
}

export interface IStorageProviderResponse
  extends IApiListResponse<IStorageProviderClient> {
  count: number;
  providerId: string;
}

export interface IStorageProviderClient {
  client: string;
  provider: string;
  noOfVerifiedDeals: number;
  verifiedDealsTotalSize: string;
  lastDealHeight: number;
}
