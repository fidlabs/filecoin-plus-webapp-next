import { CDP_API_URL } from "@/lib/constants";
import { throwHTTPErrorOrSkip } from "@/lib/http-errors";
import {
  ICDPHistogram,
  ICDPHistogramResult,
} from "@/lib/interfaces/cdp/cdp.interface";
import { IAllocatorsResponse } from "@/lib/interfaces/dmob/allocator.interface";
import { assertSchema, objectToURLSearchParams } from "@/lib/utils";
import { z } from "zod";

// Allocators list
export interface FetchAllocatorsParameters {
  editionId?: string;
  filter?: string;
  usingMetaallocator?: string;
  limit?: number;
  page?: number;
  sort?: string;
  order?: "asc" | "desc";
  showInactive?: boolean;
  isMetaallocator?: boolean;
}

export type FetchAllocatorsReturnType = IAllocatorsResponse;

export async function fetchAllocators(
  parameters: FetchAllocatorsParameters = {}
) {
  const searchParams = objectToURLSearchParams(parameters, true);
  const endpoint = `${CDP_API_URL}/allocators?${searchParams.toString()}`;
  const response = await fetch(endpoint);

  throwHTTPErrorOrSkip(
    response,
    `CDP API returned status ${response.status} when fetching allocators; URL: ${endpoint}`
  );

  const data = await response.json();
  return data as IAllocatorsResponse;
}

// Allocators by compliance list
export interface FetchAllocatorsByComplianceParameters
  extends Omit<FetchAllocatorsParameters, "showInactive" | "isMetaallocator"> {
  retrievability?: boolean;
  numberOfClients?: boolean;
  totalDealSize?: boolean;
  week?: string;
  complianceThresholdPercentage?: number;
  complianceScore?: "nonCompliant" | "partiallyCompliant" | "compliant";
}

export type FetchAllocatorsByComplianceReturnType = IAllocatorsResponse;

export async function fetchAllocatorsByCompliance(
  parameters: FetchAllocatorsByComplianceParameters = {}
) {
  const searchParams = objectToURLSearchParams(parameters, true);
  const endpoint = `${CDP_API_URL}/allocators/compliance-data?${searchParams.toString()}`;
  const response = await fetch(endpoint);

  throwHTTPErrorOrSkip(
    response,
    `CDP API returned status ${response.status} when fetching allocators compliance data; URL: ${endpoint}`
  );

  const data = await response.json();
  return data as IAllocatorsResponse;
}

// Allocators Storage Providers compliance data
const allocatorsSPsComplianceDataSchema = z.object({
  averageSuccessRate: z.number(),
  results: z.array(
    z.object({
      week: z.string(),
      averageSuccessRate: z.number(),
      allocators: z.array(
        z.object({
          compliantSpsPercentage: z.number(),
          partiallyCompliantSpsPercentage: z.number(),
          nonCompliantSpsPercentage: z.number(),
          totalSps: z.number(),
          totalDatacap: z.union([z.string(), z.number()]),
        })
      ),
    })
  ),
});

type AllocatorsSPsComplianceData = z.infer<
  typeof allocatorsSPsComplianceDataSchema
>;

export interface FetchAllocatorsSPsComplianceDataParameters {
  editionId?: string;
  retrievability?: boolean;
  numberOfClients?: boolean;
  totalDealSize?: boolean;
}

export type FetchAllocatorsSPsComplianceDataReturnType =
  AllocatorsSPsComplianceData;

export async function fetchAllocatorsSPsComplianceData(
  parameters: FetchAllocatorsSPsComplianceDataParameters = {}
): Promise<FetchAllocatorsSPsComplianceDataReturnType> {
  const searchParams = objectToURLSearchParams(parameters, true);
  const endpoint = `${CDP_API_URL}/stats/acc/allocators/sps-compliance?${searchParams.toString()}`;
  const response = await fetch(endpoint);

  throwHTTPErrorOrSkip(
    response,
    `CDP API returned status ${response.status} when fetching allocators SPs compliance data; URL: ${endpoint}`
  );

  const data = await response.json();

  assertSchema(
    data,
    allocatorsSPsComplianceDataSchema,
    `Invalid response from CDP when fetching allocators SPs compliance data; URL: ${endpoint}`
  );

  return data;
}

// Score ranking
type ScoreRankingDataType = z.infer<typeof scoreRankingDataTypeEnum>;
type ScoreRankingResponse = z.infer<typeof scoreRankingResponseSchema>;

export interface FetchAllocatorScoreRankingParameters {
  dataType?: ScoreRankingDataType;
}

export type FetchAllocatorScoreRankingReturnType = ScoreRankingResponse;

const scoreRankingDataTypeEnum = z.enum(["openData", "enterprise"]);
const scoreRankingResponseSchema = z.array(
  z.object({
    allocatorId: z.string(),
    allocatorName: z.string(),
    totalScore: z.number(),
    maxPossibleScore: z.number(),
    scorePercentage: z.string(),
    dataType: scoreRankingDataTypeEnum,
  })
);

export async function fetchAllocatorScoreRanking(
  parameters: FetchAllocatorScoreRankingParameters = {}
): Promise<FetchAllocatorScoreRankingReturnType> {
  const searchParams = objectToURLSearchParams(parameters, true);
  const endpoint = `${CDP_API_URL}/allocators/latest-scores?${searchParams.toString()}`;
  const response = await fetch(endpoint);

  throwHTTPErrorOrSkip(
    response,
    `CDP API returned status ${response.status} when fetching allocators score ranking; URL: ${endpoint}`
  );

  const data = await response.json();

  assertSchema(
    data,
    scoreRankingResponseSchema,
    `CDP API returned invalid response when fetching allocators score ranking; URL: ${endpoint}`
  );

  return data;
}

// Retrievability
export interface FetchAllocatorsRetrievabilityDataParameters {
  editionId?: string;
  openDataOnly?: boolean;
  retrievabilityType?: "urlFinder" | "http";
}

export type FetchAllocatorsRetrievabilityDataReturnType = ICDPHistogramResult;

export async function fetchAllocatorsRetrievabilityData(
  parameters?: FetchAllocatorsRetrievabilityDataParameters
): Promise<FetchAllocatorsRetrievabilityDataReturnType> {
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

  const endpoint = `${CDP_API_URL}/stats/acc/allocators/retrievability?${searchParams.toString()}`;
  const response = await fetch(endpoint);

  throwHTTPErrorOrSkip(
    response,
    `CDP API returned status ${response.status} when fetching allocators retrievability data; URL: ${endpoint}`
  );

  const json = await response.json();
  return json as ICDPHistogramResult;
}

// Client diversity
export interface FetchAllocatorsClientDiversityDataParameters {
  editionId?: string;
}

export type FetchAllocatorsClientDiversityDataReturnType = ICDPHistogram;

export async function fetchAllocatorsClientDiversityData(
  parameters?: FetchAllocatorsClientDiversityDataParameters
): Promise<FetchAllocatorsClientDiversityDataReturnType> {
  const { editionId } = parameters ?? {};

  const searchParams = objectToURLSearchParams(
    {
      editionId,
    },
    true
  );

  const endpoint = `${CDP_API_URL}/stats/acc/allocators/clients?${searchParams.toString()}`;
  const response = await fetch(endpoint);

  throwHTTPErrorOrSkip(
    response,
    `CDP API returned status ${response.status} when fetching allocators client diversity data; URL: ${endpoint}`
  );

  const json = await response.json();
  return json as ICDPHistogram;
}

// Biggest client distribution
export interface FetchAllocatorsClientDistributionDataParameters {
  editionId?: string;
}

export type FetchAllocatorsClientDistributionDataReturnType = ICDPHistogram;

export async function fetchAllocatorsClientDistributionData(
  parameters?: FetchAllocatorsClientDistributionDataParameters
): Promise<FetchAllocatorsClientDistributionDataReturnType> {
  const { editionId } = parameters ?? {};

  const searchParams = objectToURLSearchParams(
    {
      editionId,
    },
    true
  );

  const endpoint = `${CDP_API_URL}/stats/acc/allocators/biggest-client-distribution?${searchParams.toString()}`;
  const response = await fetch(endpoint);

  throwHTTPErrorOrSkip(
    response,
    `CDP API returned status ${response.status} when fetching allocators biggest client distribution data; URL: ${endpoint}`
  );

  const json = await response.json();
  return json as ICDPHistogram;
}

// Allocators audit states
const allocatorsAuditStatesResponseSchema = z.array(
  z.object({
    allocatorId: z.string(),
    allocatorName: z.string().nullable(),
    audits: z.array(
      z.object({
        started: z.string().datetime().nullable(),
        ended: z.string().datetime().nullable(),
        dc_allocated: z
          .union([z.literal(""), z.string().datetime()])
          .nullable(),
        outcome: z.enum([
          "invalid",
          "unknown",
          "notAudited",
          "passed",
          "passedConditionally",
          "failed",
        ]),
        datacap_amount: z.number(),
      })
    ),
  })
);

type AllocatorsAuditStatesResponse = z.infer<
  typeof allocatorsAuditStatesResponseSchema
>;

export interface FetchAllocatorsAuditStatesParameters {
  editionId?: string;
}

export type FetchAllocatorsAuditStatesReturnType =
  AllocatorsAuditStatesResponse;

export async function fetchAllocatorsAuditStates(
  params: FetchAllocatorsAuditStatesParameters
): Promise<AllocatorsAuditStatesResponse> {
  const endpoint = `${CDP_API_URL}/allocators/audit-states?${objectToURLSearchParams(params)}`;
  const response = await fetch(endpoint, { next: { revalidate: 300 } });

  throwHTTPErrorOrSkip(
    response,
    `CDP API returned status ${response.status} when fetching allocator's audit states; URL: ${endpoint}`
  );

  const data = await response.json();

  assertSchema(
    data,
    allocatorsAuditStatesResponseSchema,
    `Invalid response from CDP API while fetching allocators audit states; URL: ${endpoint}`
  );

  return data;
}

// Audit outcomes
export interface FetchAllocatorsAuditOutcomesParameters {
  editionId?: string;
}

export type FetchAllocatorsAuditOutcomesReturnType = z.infer<
  typeof allocatorsAuditOutcomesResponseSchema
>;

const allocatorsAuditOutcomesEnum = z.enum([
  "unknown",
  "failed",
  "passed",
  "passedConditionally",
  "notAudited",
]);

const allocatorsAuditOutcomesResponseSchema = z.array(
  z.object({
    month: z.string(),
    datacap: z.record(allocatorsAuditOutcomesEnum, z.number()),
    count: z.record(allocatorsAuditOutcomesEnum, z.number()),
  })
);

export async function fetchAllocatorsAuditOutcomes(
  params: FetchAllocatorsAuditOutcomesParameters
): Promise<FetchAllocatorsAuditOutcomesReturnType> {
  const endpoint = `${CDP_API_URL}/allocators/audit-outcomes?${objectToURLSearchParams(params)}`;
  const response = await fetch(endpoint, { next: { revalidate: 300 } });

  throwHTTPErrorOrSkip(
    response,
    `CDP API returned status ${response.status} when fetching allocator's audit states; URL: ${endpoint}`
  );

  const data = await response.json();

  assertSchema(
    data,
    allocatorsAuditOutcomesResponseSchema,
    `Invalid response from CDP API while fetching allocators audit outcomes; URL: ${endpoint}`
  );

  return data;
}
