import {IApiQuery} from "@/lib/interfaces/api.interface";
import {
  IFilDCAllocationsWeekly,
  IFilDCAllocationsWeeklyByClient, IFilDCFLow,
  IFilPlusStats
} from "@/lib/interfaces/dmob/dmob.interface";
import {IAllocatorResponse, IAllocatorsResponse} from "@/lib/interfaces/dmob/allocator.interface";
import {
  IClientAllocationsResponse,
  IClientProviderBreakdownResponse,
  IClientResponse,
  IClientsResponse
} from "@/lib/interfaces/dmob/client.interface";
import {IStorageProviderResponse, IStorageProvidersResponse} from "@/lib/interfaces/dmob/sp.interface";
import {IGoogleSheetResponse} from "@/lib/interfaces/cdp/google.interface";

const revalidate = 12 * 60 * 60;
const apiUrl = 'https://api.datacapstats.io/api'

export const fetchData = async (url: string) => {
  const headers = new Headers();
  headers.append('Content-Type', 'application/json');

  const response = await fetch(url, {
    method: 'GET',
    headers: headers,
    next: { revalidate }
  });

  if (!response.ok) {
    throw await response.json();
  }

  return await response.json();
}

export const parseQuery = (query?: IApiQuery) => {
  if (!query) {
    return '';
  }
  const searchParams = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.append(key, value.toString());
    }
  });
  return `?${searchParams.toString()}`;
}

export const getStats = async () => {
  const url = `${apiUrl}/getFilPlusStats`
  return await fetchData(url) as IFilPlusStats;
}

export const getDataCapAllocationsWeekly = async () => {
  const url = `${apiUrl}/get-dc-allocated-to-clients-total-by-week`
  return await fetchData(url) as IFilDCAllocationsWeekly;
}

export const getDataCapAllocationsWeeklyByClient = async () => {
  const url = `${apiUrl}/get-dc-allocated-to-clients-grouped-by-verifiers-wow`
  return await fetchData(url) as IFilDCAllocationsWeeklyByClient;
}

export const getAllocators = async (query?: IApiQuery) => {
  const url = `${apiUrl}/getVerifiers${parseQuery(query)}`
  return await fetchData(url) as IAllocatorsResponse;
}

export const getAllocatorById = async (id: string, query?: IApiQuery) => {
  const url = `${apiUrl}/getVerifiedClients/${id}${parseQuery(query)}`
  return await fetchData(url) as IAllocatorResponse;
}

export const getDCFlow = async () => {
  const url = `${apiUrl}/get-dc-flow-graph-grouped-by-audit-status`
  return await fetchData(url) as IFilDCFLow;
}

export const getClients = async (query?: IApiQuery) => {
  const url = `${apiUrl}/getVerifiedClients${parseQuery(query)}`
  return await fetchData(url) as IClientsResponse;
}

export const getClientById = async (id: string, query?: IApiQuery) => {
  const url = `${apiUrl}/v2/getUnifiedVerifiedDeals/${id}${parseQuery(query)}`
  return await fetchData(url) as IClientResponse;
}

export const getClientProviderBreakdownById = async (id: string) => {
  const url = `${apiUrl}/v2/getDealAllocationStats/${id}`
  return await fetchData(url) as IClientProviderBreakdownResponse;
}

export const getClientAllocationsById = async (id: string) => {
  const url = `${apiUrl}/getVerifiedClients?filter=${id}`
  return await fetchData(url) as IClientAllocationsResponse;
}

export const getStorageProviders = async (query?: IApiQuery) => {
  const url = `${apiUrl}/v2/getMiners${parseQuery(query)}`
  return await fetchData(url) as IStorageProvidersResponse;
}

export const getStorageProviderById = async (id: string, query?: IApiQuery) => {
  const url = `${apiUrl}/v2/getMinerInfo/${id}${parseQuery(query)}`
  return await fetchData(url) as IStorageProviderResponse;
}

export const getGoogleSheetAuditHistory = async () => {
  const url = `https://cdp.allocator.tech/proxy/googleapis/allocators-overview`
  return await fetchData(url) as IGoogleSheetResponse;
}

export const getGoogleSheetAuditHistorySizes = async () => {
  const url = `https://cdp.allocator.tech/proxy/googleapis/allocators-overview?tab=Audit+Results+per+DC`
  return await fetchData(url) as IGoogleSheetResponse;
}

export const getGoogleSheetAuditSizes = async () => {
  const url = `https://cdp.allocator.tech/proxy/googleapis/allocators-overview?tab=Raw+Data`
  return await fetchData(url) as IGoogleSheetResponse;
}