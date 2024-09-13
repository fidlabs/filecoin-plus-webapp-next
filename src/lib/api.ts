import {IApiQuery} from "@/lib/interfaces/api.interface";
import {
  IAllocatorsResponse,
  IFilDCAllocationsWeekly,
  IFilDCAllocationsWeeklyByClient,
  IFilDCFLow,
  IFilPlusStats
} from "@/lib/interfaces/dmob.interface";

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

export const getDCFlow = async () => {
  const url = `${apiUrl}/get-dc-flow-graph-grouped-by-audit-status`
  return await fetchData(url) as IFilDCFLow;
}