import { getStorageProviders } from "@/lib/api";

export interface FetchStorageProvidersListParameters {
  limit?: number;
  page?: number;
  sort?: string;
  order?: "asc" | "desc";
  provider?: string;
}

export interface FetchStorageProvidersListReturnType {
  storageProviders: Array<{
    provider: string;
    noOfVerifiedDeals: number;
    noOfClients: number;
    verifiedDealsTotalSize: string;
    lastDealHeight: number;
  }>;
  totalCount: number;
}

export async function fetchStorageProvidersList(
  parameters?: FetchStorageProvidersListParameters
): Promise<FetchStorageProvidersListReturnType> {
  const { limit = 10, page = 1, ...restOfParameters } = parameters ?? {};
  const storageProvidersResponse = await getStorageProviders({
    limit: limit.toString(),
    page: page.toString(),
    ...restOfParameters,
  });

  return {
    storageProviders: storageProvidersResponse.data,
    totalCount: storageProvidersResponse.count,
  };
}
