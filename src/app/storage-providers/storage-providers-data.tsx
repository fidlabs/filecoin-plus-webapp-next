import { getStorageProviders } from "@/lib/api";
import { CDP_API_URL } from "@/lib/constants";
import { throwHTTPErrorOrSkip } from "@/lib/http-errors";
import { type ICDPHistogram } from "@/lib/interfaces/cdp/cdp.interface";
import {
  type CdpStorageProvidersStatisticsResponse,
  cdpStorageProvidersStatisticsResponseSchema,
  StorageProvidersDashboardStatisticType,
} from "@/lib/schemas";
import { assertSchema, objectToURLSearchParams } from "@/lib/utils";
import { weekFromDate } from "@/lib/weeks";
import { z } from "zod";

// Statistics
export interface FetchStorageProvidersDashboardStatisticsParameters {
  interval?: "day" | "week" | "month";
}

export type FetchStorageProvidersDashboardStatisticsReturnType =
  CdpStorageProvidersStatisticsResponse;

export async function fetchStorageProvidersDashboardStatistics(
  parameters?: FetchStorageProvidersDashboardStatisticsParameters
): Promise<FetchStorageProvidersDashboardStatisticsReturnType> {
  const searchParams = objectToURLSearchParams(parameters ?? {});
  const endpoint = `${CDP_API_URL}/storage-providers/statistics?${searchParams.toString()}`;
  const response = await fetch(endpoint);

  throwHTTPErrorOrSkip(
    response,
    `CDP API returned status ${response.status} when fetching storage providers statistics; URL: ${endpoint}`
  );

  const json = await response.json();

  assertSchema(
    json,
    cdpStorageProvidersStatisticsResponseSchema,
    `CDP API returned invalid response when fetching storage providers statistics; URL: ${endpoint}`
  );

  return json.filter((statistic) => {
    // Hide those stats unitl DDOs are fixed in DMOB database or we migrate to other data source
    return !(
      [
        StorageProvidersDashboardStatisticType.DDO_DEALS_PERCENTAGE,
        StorageProvidersDashboardStatisticType.DDO_DEALS_PERCENTAGE_TO_DATE,
      ] as string[]
    ).includes(statistic.type);
  });
}

// Storage Providers list
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

// Storage Providers compliance
export type StorageProvidersComplianceData = z.infer<
  typeof providersComplianceDataSchema
>;

export interface FetchStorageProvidersComplianceDataParameters {
  editionId?: string;
  httpRetrievability?: boolean;
  urlFinderRetrievability?: boolean;
  numberOfClients?: boolean;
  totalDealSize?: boolean;
}

export type FetchStorageProvidersComplianceDataReturnType =
  StorageProvidersComplianceData;

const providersComplianceDataSchema = z.object({
  averageHttpSuccessRate: z.number().nullable(),
  averageUrlFinderSuccessRate: z.number().nullable(),
  results: z.array(
    z.object({
      week: z.string(),
      averageHttpSuccessRate: z.number().nullable(),
      averageUrlFinderSuccessRate: z.number().nullable(),
      compliantSps: z.number(),
      partiallyCompliantSps: z.number(),
      nonCompliantSps: z.number(),
      totalSps: z.number(),
      compliantSpsTotalDatacap: z.union([z.number(), z.string()]),
      partiallyCompliantSpsTotalDatacap: z.union([z.number(), z.string()]),
      nonCompliantSpsTotalDatacap: z.union([z.number(), z.string()]),
    })
  ),
});

export async function fetchStorageProvidersComplianceData(
  parameters?: FetchStorageProvidersComplianceDataParameters
): Promise<FetchStorageProvidersComplianceDataReturnType> {
  const searchParams = objectToURLSearchParams(parameters ?? {}, true);
  const endpoint = `${CDP_API_URL}/stats/acc/providers/compliance-data?${searchParams.toString()}`;
  const response = await fetch(endpoint);

  throwHTTPErrorOrSkip(
    response,
    `CDP API returned status ${response.status} when fetching storage providers compliance data; URL: ${endpoint}`
  );

  const json = await response.json();

  assertSchema(
    json,
    providersComplianceDataSchema,
    `Invalid response from CDP when fetching storage providers compliance data; URL: ${endpoint}`
  );

  return json;
}

// Storage Providers compliance data weeks
type WeeksResponse = z.infer<typeof weeksResponseSchema>;

const weeksResponseSchema = z.object({
  results: z.array(
    z.object({
      week: z.string(),
    })
  ),
});

function assertIsWeeksResponse(input: unknown): asserts input is WeeksResponse {
  const validationResult = weeksResponseSchema.safeParse(input);

  if (!validationResult.success) {
    throw new TypeError(
      "Invalid response from CDP while fetching SP complaince data"
    );
  }
}

export async function fetchStorageProvidersComplianceDataWeeks() {
  const endpoint = `${CDP_API_URL}/stats/acc/providers/compliance-data`;
  const response = await fetch(endpoint);

  throwHTTPErrorOrSkip(
    response,
    `CDP API returned status ${response.status} when fetching storage providers compliance data weeks; URL: ${endpoint}`
  );

  const json = await response.json();
  assertIsWeeksResponse(json);
  return json.results.map((result) => weekFromDate(result.week)).toReversed();
}

// Retrievability
const retrievabilityResponseSchema = z.object({
  averageHttpSuccessRate: z.number().nullable(),
  averageUrlFinderSuccessRate: z.number().nullable(),
  histogram: z.object({
    total: z.number(),
    results: z.array(
      z.object({
        week: z.string(),
        total: z.number(),
        averageHttpSuccessRate: z.number().nullable(),
        averageUrlFinderSuccessRate: z.number().nullable(),
        results: z.array(
          z.object({
            valueFromExclusive: z.number(),
            valueToInclusive: z.number(),
            count: z.number(),
            totalDatacap: z.string(),
          })
        ),
      })
    ),
  }),
});

export interface FetchStorageProvidersRetrievabilityDataParameters {
  editionId?: string;
  openDataOnly?: boolean;
  retrievabilityType?: "urlFinder" | "http";
}

export type FetchStorageProvidersRetrievabilityDataReturnType = z.infer<
  typeof retrievabilityResponseSchema
>;

export async function fetchStorageProvidersRetrievabilityData(
  parameters?: FetchStorageProvidersRetrievabilityDataParameters
): Promise<FetchStorageProvidersRetrievabilityDataReturnType> {
  const {
    editionId,
    openDataOnly = false,
    retrievabilityType,
  } = parameters ?? {};

  const searchParams = objectToURLSearchParams(
    {
      editionId,
      openDataOnly,
      retrievabilityType,
    },
    true
  );

  const endpoint = `${CDP_API_URL}/stats/acc/providers/retrievability?${searchParams.toString()}`;
  const response = await fetch(endpoint);

  throwHTTPErrorOrSkip(
    response,
    `CDP API returned status ${response.status} when fetching storage providers retrievability data; URL: ${endpoint}`
  );

  const json = await response.json();

  assertSchema(
    json,
    retrievabilityResponseSchema,
    `CDP API returned invalid response when fetching storage providers retrievability data; URL: ${endpoint}`
  );

  return json;
}

// Client diversity
export interface FetchStorageProvidersClientDiversityDataParameters {
  editionId?: string;
}

export type FetchStorageProvidersClientDiversityDataReturnType = ICDPHistogram;

export async function fetchStorageProvidersClientDiversityData(
  parameters?: FetchStorageProvidersClientDiversityDataParameters
): Promise<FetchStorageProvidersClientDiversityDataReturnType> {
  const { editionId } = parameters ?? {};

  const searchParams = objectToURLSearchParams(
    {
      editionId,
    },
    true
  );

  const endpoint = `${CDP_API_URL}/stats/acc/providers/clients?${searchParams.toString()}`;
  const response = await fetch(endpoint);

  throwHTTPErrorOrSkip(
    response,
    `CDP API returned status ${response.status} when fetching storage providers client diversity data; URL: ${endpoint}`
  );

  const json = await response.json();
  return json as ICDPHistogram;
}

// Biggest client distribution
export interface FetchStorageProvidersClientDistributionDataParameters {
  editionId?: string;
}

export type FetchStorageProvidersClientDistributionDataReturnType =
  ICDPHistogram;

export async function fetchStorageProvidersClientDistributionData(
  parameters?: FetchStorageProvidersClientDistributionDataParameters
): Promise<FetchStorageProvidersClientDistributionDataReturnType> {
  const { editionId } = parameters ?? {};

  const searchParams = objectToURLSearchParams(
    {
      editionId,
    },
    true
  );

  const endpoint = `${CDP_API_URL}/stats/acc/providers/biggest-client-distribution?${searchParams.toString()}`;
  const response = await fetch(endpoint);

  throwHTTPErrorOrSkip(
    response,
    `CDP API returned status ${response.status} when fetching storage providers biggest client distribution data; URL: ${endpoint}`
  );

  const json = await response.json();
  return json as ICDPHistogram;
}

// IPNI Mistreporting
export type IPNIMisreportingResponse = z.infer<typeof ipniMisreportingSchema>;

export interface FetchStorageProvidersIPNIMistreportingDataParameters {
  editionId?: string;
}

export type FetchStorageProvidersIPNIMistreportingDataReturnType =
  IPNIMisreportingResponse;

const ipniMisreportingSchema = z.object({
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

function assertIsIPNIMisreportingReponse(
  input: unknown
): asserts input is IPNIMisreportingResponse {
  const result = ipniMisreportingSchema.safeParse(input);

  if (!result.success) {
    throw new TypeError(
      "Invalid response from CDP API when fetching SPs historical IPNI status"
    );
  }
}

export async function fetchStorageProvidersIPNIMisreportingData(
  parameters?: FetchStorageProvidersIPNIMistreportingDataParameters
): Promise<IPNIMisreportingResponse> {
  const { editionId } = parameters ?? {};
  const searchParams = objectToURLSearchParams({ editionId }, true);

  const endpoint = `${CDP_API_URL}/stats/acc/providers/aggregated-ipni-status-weekly?${searchParams.toString()}`;
  const response = await fetch(endpoint);

  if (!response.ok) {
    throw new Error(
      `CDP API returned status ${response.status} when fetching SPs historical IPNI status`
    );
  }

  const data = await response.json();
  assertIsIPNIMisreportingReponse(data);
  return data;
}
