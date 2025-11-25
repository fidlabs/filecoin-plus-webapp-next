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
import { IClientsResponse } from "@/lib/interfaces/dmob/client.interface";
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
import { throwHTTPErrorOrSkip } from "./http-errors";
import { objectToURLSearchParams } from "./utils";

const revalidate = 30;
const apiUrl = "https://api.datacapstats.io/api";

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

export const getAllocatorReports = async (allocatorId: string) => {
  const url = `${CDP_API_URL}/allocator-report/${allocatorId}`;
  return (await fetchData(url)) as IClientReportsResponse;
};

export async function getClientReportById(clientId: string, reportId: string) {
  const url = `${CDP_API_URL}/client-report/${clientId}/${reportId}`;
  const response = await fetch(url);
  throwHTTPErrorOrSkip(
    response,
    `CDP API returned status ${response.status} when fetching client report. URL: ${url}`
  );

  const data = await response.json();
  return data as IClientFullReport;
}

export async function getAllocatorReportById(
  allocatorId: string,
  reportId: string,
  query?: IApiQuery
) {
  const url = `${CDP_API_URL}/allocator-report/${allocatorId}/${reportId}${parseQuery(query)}`;
  const response = await fetch(url);
  throwHTTPErrorOrSkip(
    response,
    `CDP API returned status ${response.status} when fetching allocator report. URL: ${url}`
  );

  const data = await response.json();
  return data as ICDPAllocatorFullReport;
}

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

// Report Checks
const allocatorsReportChecksWeeksSchema = z.array(
  z.object({
    week: z.string().datetime(),
    checksPassedCount: z.number(),
    checksPassedChange: z.number().nullish(),
    checksFailedCount: z.number(),
    checksFailedChange: z.number().nullish(),
  })
);

const allocatorsReportChecksDaysSchema = z.object({
  week: z.string().datetime(),
  results: z.array(
    z.object({
      day: z.string().datetime(),
      checksPassedCount: z.number(),
      checksPassedChange: z.number().nullish(),
      checksFailedCount: z.number(),
      checksFailedChange: z.number().nullish(),
    })
  ),
});

const allocatorsDailyReportChecksSchema = z.object({
  day: z.string().datetime(),
  results: z.array(
    z.object({
      allocatorId: z.string(),
      allocatorName: z.string().nullable(),
      checksPassedCount: z.number(),
      checksPassedChange: z.number().nullish(),
      checksFailedCount: z.number(),
      checksFailedChange: z.number().nullish(),
      failedChecks: z.array(
        z.object({
          checkMsg: z.string(),
          reportId: z.string(),
          check: z.string(),
          isNewDaily: z.boolean(),
          isNewWeekly: z.boolean(),
          firstSeen: z.string(),
          lastSeen: z.string().nullish(),
          lastPassed: z.string().nullish(),
        })
      ),
    })
  ),
});

export type AllocatorsReportChecksWeeksResponse = z.infer<
  typeof allocatorsReportChecksWeeksSchema
>;
export type AllocatorsReportChecksDaysResponse = z.infer<
  typeof allocatorsReportChecksDaysSchema
>;
export type AllocatorsDailyReportChecksResponse = z.infer<
  typeof allocatorsDailyReportChecksSchema
>;

function assertIsAllocatorsReportChecksWeeksResponse(
  input: unknown
): asserts input is AllocatorsReportChecksWeeksResponse {
  const result = allocatorsReportChecksWeeksSchema.safeParse(input);

  if (!result.success) {
    throw new TypeError(
      "Invalid response from CDP API when fetching weekly report checks"
    );
  }
}

export async function fetchAllocatorsReportChecksWeeks(): Promise<AllocatorsReportChecksWeeksResponse> {
  const endpoint = `${CDP_API_URL}/report-checks/allocator/weekly`;
  const response = await fetch(endpoint);

  if (!response.ok) {
    throw new Error(
      `CDP API returned status ${response.status} when fetching weekly report checks. URL: ${endpoint}`
    );
  }

  const data = await response.json();
  assertIsAllocatorsReportChecksWeeksResponse(data);
  return data;
}

function assertIsAllocatorsReportChecksDaysResponse(
  input: unknown
): asserts input is AllocatorsReportChecksDaysResponse {
  const result = allocatorsReportChecksDaysSchema.safeParse(input);

  if (!result.success) {
    throw new TypeError(
      "Invalid response from CDP API when fetching daily report checks"
    );
  }
}

export async function fetchAllocatorsReportChecksDays(
  week?: string
): Promise<AllocatorsReportChecksDaysResponse> {
  let endpoint = `${CDP_API_URL}/report-checks/allocator/daily`;

  if (week) {
    endpoint = endpoint + "?" + objectToURLSearchParams({ week });
  }

  const response = await fetch(endpoint);

  if (!response.ok) {
    throw new Error(
      `CDP API returned status ${response.status} when fetching daily report checks`
    );
  }

  const data = await response.json();
  assertIsAllocatorsReportChecksDaysResponse(data);
  return data;
}

function assertIsAllocatorsDailyReportChecksResponse(
  input: unknown
): asserts input is AllocatorsDailyReportChecksResponse {
  const result = allocatorsDailyReportChecksSchema.safeParse(input);

  if (!result.success) {
    throw new TypeError(
      "Invalid response from CDP API when fetching checks details"
    );
  }
}

export async function fetchAllocatorsDailyReportChecks(
  day?: string
): Promise<AllocatorsDailyReportChecksResponse> {
  let endpoint = `${CDP_API_URL}/report-checks/allocator/details`;

  if (day) {
    endpoint = endpoint + "?" + objectToURLSearchParams({ day });
  }

  const response = await fetch(endpoint);

  if (!response.ok) {
    throw new Error(
      `CDP API returned status ${response.status} when fetching checks details`
    );
  }

  const data = await response.json();
  assertIsAllocatorsDailyReportChecksResponse(data);
  return data;
}
