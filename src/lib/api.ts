import { IApiQuery } from "@/lib/interfaces/api.interface";
import {
  CPDAggregatedIPNIReport,
  ICDPAllocatorFullReport,
  IClientFullReport,
  IClientReportsResponse,
} from "@/lib/interfaces/cdp/cdp.interface";
import { IGoogleSheetResponse } from "@/lib/interfaces/cdp/google.interface";
import {
  IAllocatorResponse,
  IAllocatorsResponse,
} from "@/lib/interfaces/dmob/allocator.interface";
import {
  IClientAllocationsResponse,
  IClientResponse,
  IClientsResponse,
} from "@/lib/interfaces/dmob/client.interface";
import {
  IFilDCAllocationsWeekly,
  IFilDCAllocationsWeeklyByClient,
  IFilDCFLow,
  IFilPlusStats,
} from "@/lib/interfaces/dmob/dmob.interface";
import {
  IStorageProviderResponse,
  IStorageProvidersResponse,
} from "@/lib/interfaces/dmob/sp.interface";
import * as z from "zod";
import { CDP_API_URL } from "./constants";

const revalidate = 30;
const apiUrl = "https://api.datacapstats.io/api";

type NumericalString = `${number}`;

export const fetchData = async (url: string) => {
  const headers = new Headers();
  headers.append("Content-Type", "application/json");

  const response = await fetch(url, {
    method: "GET",
    headers: headers,
    next: { revalidate },
  });

  if (!response.ok) {
    throw await response.json();
  }

  return await response.json();
};

export const postData = async (
  url: string,
  body: { [key: PropertyKey]: unknown } | undefined = undefined
) => {
  const headers = new Headers();
  headers.append("Content-Type", "application/json");

  const response = await fetch(url, {
    method: "POST",
    headers: headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw await response.json();
  }

  return await response.json();
};

export const parseQuery = (query?: Record<string, string | undefined>) => {
  if (!query) {
    return "";
  }
  const searchParams = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      searchParams.append(key, value.toString());
    }
  });
  return `?${searchParams.toString()}`;
};

export const getStats = async () => {
  const url = `${apiUrl}/getFilPlusStats`;
  return (await fetchData(url)) as IFilPlusStats;
};

export const getDataCapAllocationsWeekly = async () => {
  const url = `${apiUrl}/get-dc-allocated-to-clients-total-by-week`;
  return (await fetchData(url)) as IFilDCAllocationsWeekly;
};

export const getDataCapAllocationsWeeklyByClient = async () => {
  const url = `${apiUrl}/get-dc-allocated-to-clients-grouped-by-verifiers-wow`;
  return (await fetchData(url)) as IFilDCAllocationsWeeklyByClient;
};

export const getAllocators = async (query?: IApiQuery) => {
  const url = `${CDP_API_URL}/allocators${parseQuery(query)}`;
  return (await fetchData(url)) as IAllocatorsResponse;
};

export const getAllocatorsByCompliance = async (query?: IApiQuery) => {
  const url = `${CDP_API_URL}/allocators/compliance-data${parseQuery(query)}`;
  return (await fetchData(url)) as IAllocatorsResponse;
};

export const getAllocatorById = async (id: string, query?: IApiQuery) => {
  const url = `${apiUrl}/getVerifiedClients/${id}${parseQuery(query)}`;
  return (await fetchData(url)) as IAllocatorResponse;
};

export const getDCFlow = async () => {
  const url = `${apiUrl}/get-dc-flow-graph-grouped-by-audit-status`;
  return (await fetchData(url)) as IFilDCFLow;
};

export const getClients = async (query?: IApiQuery) => {
  const url = `${apiUrl}/getVerifiedClients${parseQuery(query)}`;
  return (await fetchData(url)) as IClientsResponse;
};

export const getClientById = async (id: string, query?: IApiQuery) => {
  const url = `${apiUrl}/v2/getUnifiedVerifiedDeals/${id}${parseQuery(query)}`;
  return (await fetchData(url)) as IClientResponse;
};

// export const getClientProviderBreakdownById = async (id: string) => {
//   const url = `${apiUrl}/v2/getDealAllocationStats/${id}`;
//   return (await fetchData(url)) as IClientProviderBreakdownResponse;
// };

export const getClientAllocationsById = async (id: string) => {
  const url = `${apiUrl}/getVerifiedClients?filter=${id}`;
  return (await fetchData(url)) as IClientAllocationsResponse;
};

export const getStorageProviders = async (query?: IApiQuery) => {
  const url = `${CDP_API_URL}/storage-providers${parseQuery(query)}`;
  return (await fetchData(url)) as IStorageProvidersResponse;
};

export const getStorageProvidersByCompliance = async (query?: IApiQuery) => {
  const url = `${CDP_API_URL}/storage-providers/compliance-data${parseQuery(query)}`;
  return (await fetchData(url)) as IStorageProvidersResponse;
};

export const getStorageProviderById = async (id: string, query?: IApiQuery) => {
  const url = `${apiUrl}/v2/getMinerInfo/${id}${parseQuery(query)}`;
  return (await fetchData(url)) as IStorageProviderResponse;
};

export const getClientReports = async (clientId: string) => {
  const url = `${CDP_API_URL}/client-report/${clientId}`;
  return (await fetchData(url)) as IClientReportsResponse;
};

export const getAllocatorReports = async (allocatorId: string) => {
  const url = `${CDP_API_URL}/allocator-report/${allocatorId}`;
  return (await fetchData(url)) as IClientReportsResponse;
};

export const getClientReportById = async (
  clientId: string,
  reportId: string
) => {
  const url = `${CDP_API_URL}/client-report/${clientId}/${reportId}`;
  return (await fetchData(url)) as IClientFullReport;
};

export const getAllocatorReportById = async (
  allocatorId: string,
  reportId: string
) => {
  const url = `${CDP_API_URL}/allocator-report/${allocatorId}/${reportId}`;
  return (await fetchData(url)) as ICDPAllocatorFullReport;
};

export const getAggregatedIPNI = async () => {
  const url = `${CDP_API_URL}/stats/providers/aggregated-ipni-status`;
  return (await fetchData(url)) as CPDAggregatedIPNIReport;
};

export const generateClientReport = async (id: string) => {
  const url = `${CDP_API_URL}/client-report/${id}`;
  return (await postData(url)) as void;
};

export const generateAllocatorReport = async (id: string) => {
  const url = `${CDP_API_URL}/allocator-report/${id}`;
  return (await postData(url)) as void;
};

export const getGoogleSheetAuditHistory = async () => {
  const url = `${CDP_API_URL}/proxy/googleapis/allocators-overview`;
  return (await fetchData(url)) as IGoogleSheetResponse;
};

export const getGoogleSheetAuditHistorySizes = async () => {
  const url = `${CDP_API_URL}/proxy/googleapis/allocators-overview?tab=Audit+Results+per+DC`;
  return (await fetchData(url)) as IGoogleSheetResponse;
};

export const getGoogleSheetAllocatorsTrust = async () => {
  const url = `${CDP_API_URL}/proxy/googleapis/allocators-overview?tab=Trust+per+allocator+per+month`;
  return (await fetchData(url)) as IGoogleSheetResponse;
};

export const getGoogleSheetAuditSizes = async () => {
  const url = `${CDP_API_URL}/proxy/googleapis/allocators-overview?tab=JSON+Mapping`;
  return (await fetchData(url)) as IGoogleSheetResponse;
};

export const getGoogleSheetAuditTimeline = async () => {
  const url = `${CDP_API_URL}/proxy/googleapis/allocators-overview?tab=Charts`;
  return (await fetchData(url)) as IGoogleSheetResponse;
};

const numericalStringRegex = /^[0-9]{1,}$/;
const numericalStringSchema = z
  .string()
  .refine((input): input is NumericalString => {
    return numericalStringRegex.test(input);
  });

// Entities old datacap
const allocatorsOldDatacapResponseSchema = z.object({
  results: z.array(
    z.object({
      week: z.string().datetime(),
      allocators: z.number(),
      oldDatacap: numericalStringSchema,
      allocations: numericalStringSchema,
      drilldown: z.array(
        z.object({
          allocator: z.string(),
          oldDatacap: numericalStringSchema,
          allocations: numericalStringSchema,
        })
      ),
    })
  ),
});

export type AllocatorsOldDatacapResponse = z.infer<
  typeof allocatorsOldDatacapResponseSchema
>;

function assertIsAllocatorsOldDatacapResponse(
  input: unknown
): asserts input is AllocatorsOldDatacapResponse {
  const result = allocatorsOldDatacapResponseSchema.safeParse(input);

  if (!result.success) {
    throw new TypeError(
      "Invalid response from CDP API when fetching allocators old datacap"
    );
  }
}

export async function fetchAllocatorsOldDatacap(): Promise<AllocatorsOldDatacapResponse> {
  const endpoint = `${CDP_API_URL}/stats/old-datacap/allocator-balance`;
  const response = await fetch(endpoint);

  if (!response.ok) {
    throw new Error(
      `CDP API returned status ${response.status} when fetching allocators' old datacap`
    );
  }

  const data = await response.json();
  assertIsAllocatorsOldDatacapResponse(data);
  return data;
}

// Clients old datacap
const clientsOldDatacapResponseSchema = z.object({
  results: z.array(
    z.object({
      week: z.string().datetime(),
      clients: z.number(),
      oldDatacap: numericalStringSchema,
      claims: numericalStringSchema,
      drilldown: z.array(
        z.object({
          client: z.string(),
          oldDatacap: numericalStringSchema,
          claims: numericalStringSchema,
        })
      ),
    })
  ),
});

export type ClientsOldDatacapResponse = z.infer<
  typeof clientsOldDatacapResponseSchema
>;

function assertIsClientsOldDatacapResponse(
  input: unknown
): asserts input is ClientsOldDatacapResponse {
  const result = clientsOldDatacapResponseSchema.safeParse(input);

  if (!result.success) {
    throw new TypeError(
      "Invalid response from CDP API when fetching clients old datacap"
    );
  }
}

export async function fetchClientsOldDatacap(): Promise<ClientsOldDatacapResponse> {
  const endpoint = `${CDP_API_URL}/stats/old-datacap/client-balance`;
  const response = await fetch(endpoint);

  if (!response.ok) {
    throw new Error(
      `CDP API returned status ${response.status} when fetching clients' old datacap`
    );
  }

  const data = await response.json();
  assertIsClientsOldDatacapResponse(data);
  return data;
}

// IPNI Mistreporting Historical
const ipniMisreportingHistoricalSchema = z.object({
  results: z.array(
    z.object({
      week: z.string().datetime(),
      misreporting: z.number(),
      notReporting: z.number(),
      ok: z.number(),
      total: z.number(),
    })
  ),
});

export type IPNIMisreportingHistoricalReponse = z.infer<
  typeof ipniMisreportingHistoricalSchema
>;

function assertIsIPNIMisreportingHistoricalReponse(
  input: unknown
): asserts input is IPNIMisreportingHistoricalReponse {
  const result = ipniMisreportingHistoricalSchema.safeParse(input);

  if (!result.success) {
    throw new TypeError(
      "Invalid response from CDP API when fetching SPs historical IPNI status"
    );
  }
}

export async function fetchIPNIMisreportingHistoricalData(): Promise<IPNIMisreportingHistoricalReponse> {
  const endpoint = `${CDP_API_URL}/stats/acc/providers/aggregated-ipni-status-weekly`;
  const response = await fetch(endpoint);

  if (!response.ok) {
    throw new Error(
      `CDP API returned status ${response.status} when fetching SPs historical IPNI status`
    );
  }

  const data = await response.json();
  assertIsIPNIMisreportingHistoricalReponse(data);
  return data;
}

// Client Provider breakdown
const clientProvidersResponseSchema = z.object({
  name: z.string(),
  stats: z.array(
    z.object({
      provider: z.string(),
      total_deal_size: numericalStringSchema,
      percent: z.string(),
    })
  ),
});

export type ClientProvidersResponse = z.infer<
  typeof clientProvidersResponseSchema
>;

function assertIsClientProvidersResponse(
  input: unknown
): asserts input is ClientProvidersResponse {
  const result = clientProvidersResponseSchema.safeParse(input);

  if (!result.success) {
    throw new TypeError(
      "Invalid response from CDP API when fetching Client's Providers breakdown"
    );
  }
}

export async function getClientProviderBreakdownById(
  clientId: string
): Promise<ClientProvidersResponse> {
  const endpoint = `${CDP_API_URL}/clients/${clientId}/providers`;
  const response = await fetch(endpoint);

  if (!response.ok) {
    throw new Error(
      `CDP API returned status ${response.status} when fetching Client's Providers breakdown`
    );
  }

  const data = await response.json();
  assertIsClientProvidersResponse(data);
  return data;
}
