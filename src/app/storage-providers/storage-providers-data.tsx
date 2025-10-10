import { getStorageProviders } from "@/lib/api";
import { CDP_API_URL } from "@/lib/constants";
import { throwHTTPErrorOrSkip } from "@/lib/http-errors";
import { ICDPHistogramResult } from "@/lib/interfaces/cdp/cdp.interface";
import { objectToURLSearchParams } from "@/lib/utils";
import { weekFromDate } from "@/lib/weeks";
import { z } from "zod";

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
  retrievability?: boolean;
  numberOfClients?: boolean;
  totalDealSize?: boolean;
}

export type FetchStorageProvidersComplianceDataReturnType =
  StorageProvidersComplianceData;

const providersComplianceDataSchema = z.object({
  averageSuccessRate: z.number(),
  results: z.array(
    z.object({
      week: z.string(),
      averageSuccessRate: z.number(),
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

function assertIsStorageProvidersComplianceData(
  input: unknown
): asserts input is StorageProvidersComplianceData {
  const result = providersComplianceDataSchema.safeParse(input);

  if (!result.success) {
    throw new TypeError(
      "Invalid response from CDP when fetching storage providers compliance data"
    );
  }
}

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
  assertIsStorageProvidersComplianceData(json);
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
export interface FetchStorageProvidersRetrievabilityDataParameters {
  editionId?: string;
  openDataOnly?: boolean;
  retrievabilityType?: "rpa" | "http";
}

export type FetchStorageProvidersRetrievabilityDataReturnType =
  ICDPHistogramResult;

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
      // TODO: change to retrievability type when CDP is ready
      httpRetrievability: retrievabilityType === "http",
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
  return json as ICDPHistogramResult;
}
