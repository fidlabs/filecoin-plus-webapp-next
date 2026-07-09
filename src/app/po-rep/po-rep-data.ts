import { CDP_API_URL } from "@/lib/constants";
import { F0Id, F0IdInput } from "@/lib/f0-id";
import { throwHTTPErrorOrSkip } from "@/lib/http-errors";
import {
  CdpPoRepStatisticsResponse,
  cdpPoRepStatisticsResponseSchema,
} from "@/lib/schemas";
import { assertSchema, objectToURLSearchParams } from "@/lib/utils";
import {
  type NumericalString,
  numericalStringSchema,
} from "@/lib/zod-extensions";
import { z } from "zod";

interface EmptyPaginationParameters {
  limit?: undefined | never;
  page?: undefined | never;
}

interface FilledPaginationParameters {
  limit: number;
  page: number;
}

type PaginationParameters =
  | EmptyPaginationParameters
  | FilledPaginationParameters;

interface HistoricalChartParameters {
  windowSize?: "day" | "week" | "month";
}

const poRepSLITypes = [
  "retrievabilityBps",
  "bandwidthMbps",
  "latencyMs",
  "indexingPct",
] as const;

export enum PoRepSLIType {
  RETRIEVABILITY_BPS = "retrievabilityBps",
  BANDWIDTH_MBPS = "bandwidthMbps",
  LATENCY_MS = "latencyMs",
  INDEXING_PCT = "indexingPct",
}

const paginationSchema = z.object({
  total: z.number(),
  page: z.number().optional(),
  limit: z.number().optional(),
  pages: z.number().optional(),
});

// Statistics
export interface FetchPoRepDashboardStatisticsParameters {
  interval?: "day" | "week" | "month";
}

export type FetchPoRepDashboardStatisticsReturnType =
  CdpPoRepStatisticsResponse;

export async function fetchPoRepDashboardStatistics(
  parameters?: FetchPoRepDashboardStatisticsParameters
): Promise<FetchPoRepDashboardStatisticsReturnType> {
  const searchParams = objectToURLSearchParams(parameters ?? {});
  const endpoint = `${CDP_API_URL}/po-rep/statistics?${searchParams.toString()}`;
  const response = await fetch(endpoint);

  throwHTTPErrorOrSkip(
    response,
    `CDP API returned status ${response.status} when fetching PoRep statistics; URL: ${endpoint}`
  );

  const json = await response.json();

  assertSchema(
    json,
    cdpPoRepStatisticsResponseSchema,
    `CDP API returned invalid response when fetching PoRep statistics; URL: ${endpoint}`
  );

  return json;
}

// Providers
export type FetchPoRepProvidersParameters = PaginationParameters & {
  filter?: F0IdInput;
  showActive?: boolean;
};
export type FetchPoRepProvidersReturnType = z.infer<
  typeof poRepProvidersResponseSchema
>;

const poRepProvidersResponseSchema = z.object({
  data: z.array(
    z.object({
      providerId: z.string(),
      paused: z.boolean(),
      blocked: z.boolean(),
      availableBytes: numericalStringSchema,
      committedBytes: numericalStringSchema,
      pendingBytes: numericalStringSchema,
      minDealDurationDays: z.number(),
      maxDealDurationDays: z.number(),
      activeDealsCount: z.number(),
      registeredAtBlock: numericalStringSchema,
      slis: z.array(
        z.object({
          type: z.enum(poRepSLITypes),
          declaredValue: z.number(),
          measuredValues: z.array(
            z.object({
              date: z.iso.datetime(),
              value: z.number(),
            })
          ),
        })
      ),
    })
  ),
  pagination: paginationSchema,
});

export async function fetchPoRepProviders(
  parameters: FetchPoRepProvidersParameters = {}
): Promise<FetchPoRepProvidersReturnType> {
  const searchParams = objectToURLSearchParams(parameters, true);
  const endpoint = `${CDP_API_URL}/po-rep/providers?${searchParams.toString()}`;
  const response = await fetch(endpoint);

  throwHTTPErrorOrSkip(
    response,
    `CDP API returned response status "${response.status}" when fetching Po-Rep Providers; URL: ${endpoint}`
  );

  const json = await response.json();

  assertSchema(
    json,
    poRepProvidersResponseSchema,
    `Invalid response from CDP API when fetching Po-Rep Providers; URL: ${endpoint}`
  );

  return json as FetchPoRepProvidersReturnType;
}

// Payments history

// Active clients history
export type FetchPoRepActiveClientsHistoryParameters =
  HistoricalChartParameters & {
    providerId?: NumericalString | bigint | number;
  };
export type FetchPoRepActiveClientsHistoryReturnType = z.infer<
  typeof poRepActiveClientsHistoryResponseSchema
>;

const poRepActiveClientsHistoryResponseSchema = z.array(
  z.object({
    date: z.iso.date(),
    activeClientsCount: z.number(),
  })
);

export async function fetchPoRepActiveClientsHistory(
  parameters: FetchPoRepActiveClientsHistoryParameters = {}
): Promise<FetchPoRepActiveClientsHistoryReturnType> {
  const searchParams = objectToURLSearchParams(parameters, true);
  const endpoint = `${CDP_API_URL}/po-rep/active-clients-history?${searchParams.toString()}`;
  const response = await fetch(endpoint);

  throwHTTPErrorOrSkip(
    response,
    `CDP API returned response status "${response.status}" when fetching Po-Rep active clients history; URL: ${endpoint}`
  );

  const json = await response.json();

  assertSchema(
    json,
    poRepActiveClientsHistoryResponseSchema,
    `Invalid response from CDP API when fetching Po-Rep active clients history; URL: ${endpoint}`
  );

  return json;
}

// Provider SLI compliance statistics
export interface FetchPoRepProviderSliComplianceStatisticsParameters {
  providerId: F0Id | F0IdInput;
}

export type FetchPoRepProviderSliComplianceStatisticsReturnType = z.infer<
  typeof poRepProviderSliComplianceStatisticsSchema
>;

const poRepProviderSliComplianceStatisticsSchema = z.object({
  totalDealsCount: z.number(),
  activeDealsCount: z.number(),
  compliantDealsPercentage: z.number().nullable(),
  compliantDealsCount: z.number(),
  nonCompliantDealsCount: z.number(),
  unknownDealsCount: z.number(),
});

export async function fetchPoRepProviderSliComplianceStatistics({
  providerId,
}: FetchPoRepProviderSliComplianceStatisticsParameters): Promise<FetchPoRepProviderSliComplianceStatisticsReturnType> {
  const endpoint = `${CDP_API_URL}/po-rep/providers/${F0Id.from(providerId).toString()}/compliance-stats`;
  const response = await fetch(endpoint);

  throwHTTPErrorOrSkip(
    response,
    `CDP API returned response status "${response.status}" when fetching Po-Rep provider SLI compliance statistics; URL: ${endpoint}`
  );

  const json = await response.json();

  assertSchema(
    json,
    poRepProviderSliComplianceStatisticsSchema,
    `Invalid response from CDP API when fetching Po-Rep provider SLI compliance statistics; URL: ${endpoint}`
  );

  return json;
}
