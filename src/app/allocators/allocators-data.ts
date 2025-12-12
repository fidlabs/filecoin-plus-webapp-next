import { CDP_API_URL } from "@/lib/constants";
import { throwHTTPErrorOrSkip } from "@/lib/http-errors";
import { ICDPHistogram } from "@/lib/interfaces/cdp/cdp.interface";
import { IAllocatorsResponse } from "@/lib/interfaces/dmob/allocator.interface";
import { assertSchema, objectToURLSearchParams } from "@/lib/utils";
import { numericalStringSchema } from "@/lib/zod-extensions";
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
  dataType?: "openData" | "enterprise";
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
  httpRetrievability?: boolean;
  urlFinderRetrievability?: boolean;
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
  averageHttpSuccessRate: z.number().nullable(),
  averageUrlFinderSuccessRate: z.number().nullable(),
  results: z.array(
    z.object({
      week: z.string(),
      averageHttpSuccessRate: z.number(),
      averageUrlFinderSuccessRate: z.number(),
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
  httpRetrievability?: boolean;
  urlFinderRetrievability?: boolean;
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
    weekAgoScorePercentage: z.string(),
    monthAgoScorePercentage: z.string().nullable(),
    dataType: scoreRankingDataTypeEnum,
    totalDatacap: numericalStringSchema.nullable(),
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

  return data as FetchAllocatorScoreRankingReturnType;
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

export interface FetchAllocatorsRetrievabilityDataParameters {
  editionId?: string;
  openDataOnly?: boolean;
  retrievabilityType?: "urlFinder" | "http";
}

export type FetchAllocatorsRetrievabilityDataReturnType = z.infer<
  typeof retrievabilityResponseSchema
>;

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

  assertSchema(
    json,
    retrievabilityResponseSchema,
    `CDP API returned invalid response when fetching allocators retrievability data; URL: ${endpoint}`
  );

  return json;
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
          "pending",
        ]),
        datacap_amount: z.number().nullable(),
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

// Audit times
const allocatorsAuditTimesByRoundEnum = z.enum([
  "averageConversationTimesSecs",
  "averageAuditTimesSecs",
  "averageAllocationTimesSecs",
]);

const allocatorsAuditTimesByRoundResponseSchema = z.record(
  allocatorsAuditTimesByRoundEnum,
  z.array(z.number()).nullable()
);

const allocatorsAuditTimesByMonthResponseSchema = z.array(
  z.object({
    month: z.string(),
    averageAuditTimeSecs: z.number(),
    averageAllocationTimeSecs: z.number(),
  })
);

export type AllocatorsAuditTimesByRoundResponse = z.infer<
  typeof allocatorsAuditTimesByRoundResponseSchema
>;

export type AllocatorsAuditTimesByMonthResponse = z.infer<
  typeof allocatorsAuditTimesByMonthResponseSchema
>;

export interface FetchAllocatorsAuditTimesParameters {
  editionId?: string;
}

export interface FetchAllocatorsAuditTimesReturnType {
  byRound: AllocatorsAuditTimesByRoundResponse;
  byMonth: AllocatorsAuditTimesByMonthResponse;
}

export async function fetchAllocatorsAuditTimes(
  params: FetchAllocatorsAuditTimesParameters
): Promise<FetchAllocatorsAuditTimesReturnType> {
  const byRoundEndpoint = `${CDP_API_URL}/allocators/audit-times-by-round?${objectToURLSearchParams(params)}`;
  const byMonthEndpoint = `${CDP_API_URL}/allocators/audit-times-by-month?${objectToURLSearchParams(params)}`;
  const [byRoundResponse, byMonthResponse] = await Promise.all([
    fetch(byRoundEndpoint),
    fetch(byMonthEndpoint),
  ]);

  throwHTTPErrorOrSkip(
    byRoundResponse,
    `CDP API returned status ${byRoundResponse.status} when fetching allocator's audit times by round; URL: ${byRoundResponse}`
  );

  throwHTTPErrorOrSkip(
    byMonthResponse,
    `CDP API returned status ${byMonthResponse.status} when fetching allocator's audit times by month; URL: ${byMonthResponse}`
  );

  const [byRoundData, byMonthData] = await Promise.all([
    byRoundResponse.json(),
    byMonthResponse.json(),
  ]);

  assertSchema(
    byRoundData,
    allocatorsAuditTimesByRoundResponseSchema,
    `Invalid response from CDP API while fetching allocators audit times by round; URL: ${byRoundEndpoint}`
  );

  assertSchema(
    byMonthData,
    allocatorsAuditTimesByMonthResponseSchema,
    `Invalid response from CDP API while fetching allocators audit times by month; URL: ${byMonthEndpoint}`
  );

  return {
    byRound: byRoundData,
    byMonth: byMonthData,
  };
}

// Old datacap
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
          allocatorName: z.string().nullable(),
          oldDatacap: numericalStringSchema,
          allocations: numericalStringSchema,
        })
      ),
    })
  ),
});

export type FetchAllocatorsOldDatacapReturnType = z.infer<
  typeof allocatorsOldDatacapResponseSchema
>;

export async function fetchAllocatorsOldDatacap(): Promise<FetchAllocatorsOldDatacapReturnType> {
  const endpoint = `${CDP_API_URL}/stats/old-datacap/allocator-balance`;
  const response = await fetch(endpoint);

  throwHTTPErrorOrSkip(
    response,
    `CDP API returned status ${response.status} when fetching allocators' old datacap; URL: ${endpoint}`
  );

  const data = await response.json();

  assertSchema(
    data,
    allocatorsOldDatacapResponseSchema,
    `Invalid response from CDP API when fetching allocators old datacap; URL: ${endpoint}`
  );

  return data as FetchAllocatorsOldDatacapReturnType; // cast beacause for some reason Zod does not like custom schema here
}

// Checks breakdown
const checksBreakdownSchema = z.array(
  z.object({
    check: z.string(),
    checkName: z.string(),
    checkDescription: z.string(),
    data: z.array(
      z.object({
        date: z.string(),
        checkFailedAllocatorsCount: z.number(),
        checkPassedAllocatorsCount: z.number(),
        checkFailedAllocatorsDatacap: numericalStringSchema,
        checkPassedAllocatorsDatacap: numericalStringSchema,
      })
    ),
  })
);

export interface FetchAllocatorsChecksBreakdownParameters {
  groupBy?: "week" | "month";
}

export type FetchAllocatorsChecksBreakdownReturnType = z.infer<
  typeof checksBreakdownSchema
>;

export async function fetchAllocatorsChecksBreakdown(
  parameters: FetchAllocatorsChecksBreakdownParameters = {}
): Promise<FetchAllocatorsChecksBreakdownReturnType> {
  const endpoint = `${CDP_API_URL}/report-checks/allocator/summary-by-check?${objectToURLSearchParams(parameters).toString()}`;
  const response = await fetch(endpoint);

  throwHTTPErrorOrSkip(
    response,
    `CDP API return status ${response.status} when fetching allocators checks breakdown; URL: ${endpoint}`
  );

  const data = await response.json();

  assertSchema(
    data,
    checksBreakdownSchema,
    `Invalid response from CDP API when fetching allocators checks breakdown; URL: ${endpoint}`
  );

  return data as FetchAllocatorsChecksBreakdownReturnType; // cast beacause for some reason Zod does not like custom schema here
}

// Scoring breakdown
export interface FetchAllocatorsScoringBreakdownParameters {
  groupBy?: "week" | "month";
  dataType?: "openData" | "enterprise";
  mediumScoreThreshold?: number;
  highScoreThreshold?: number;
  includeDetails?: boolean;
}

export type FetchAllocatorsScoringBreakdownReturnType = z.infer<
  typeof scoringBreakdownSchema
>;

const scoringBreakdownAllocatorSchema = z.object({
  dataType: z.enum(["enterprise", "openData"]),
  reportId: z.string(),
  createDate: z.string().datetime(),
  totalScore: z.number(),
  allocatorId: z.string(),
  totalDatacap: z.string(),
  scorePercentage: z.string(),
  maxPossibleScore: z.number(),
});

const scoringBreakdownSchema = z.array(
  z.object({
    metric: z.string(),
    metricName: z.string(),
    metricDescription: z.string(),
    metricUnit: z.string().nullable(),
    data: z.array(
      z.object({
        date: z.string().datetime(),
        scoreLowAllocators: z.array(scoringBreakdownAllocatorSchema).nullable(),
        scoreMediumAllocators: z
          .array(scoringBreakdownAllocatorSchema)
          .nullable(),
        scoreHighAllocators: z
          .array(scoringBreakdownAllocatorSchema)
          .nullable(),
        scoreLowAllocatorsCount: z.number(),
        scoreMediumAllocatorsCount: z.number(),
        scoreHighAllocatorsCount: z.number(),
        scoreLowAllocatorsDatacap: numericalStringSchema,
        scoreMediumAllocatorsDatacap: numericalStringSchema,
        scoreHighAllocatorsDatacap: numericalStringSchema,
      })
    ),
  })
);

export async function fetchAllocatorsScoringBreakdown(
  parameters: FetchAllocatorsScoringBreakdownParameters = {}
): Promise<FetchAllocatorsScoringBreakdownReturnType> {
  const searchParams = objectToURLSearchParams(parameters, true);
  const endpoint = `${CDP_API_URL}/allocators/scores-summary-by-metric?${searchParams.toString()}`;
  const response = await fetch(endpoint);

  throwHTTPErrorOrSkip(
    response,
    `CDP API returned status code ${response.status} when fetching allocators scoring breakdown; URL: ${endpoint}`
  );

  const json = await response.json();

  assertSchema(
    json,
    scoringBreakdownSchema,
    `CDP API return invalid data when fetching allocators scoring breakdown; URL: ${endpoint}`
  );

  return json as FetchAllocatorsScoringBreakdownReturnType;
}
