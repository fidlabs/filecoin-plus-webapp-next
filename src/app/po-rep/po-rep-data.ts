import { CDP_API_URL } from "@/lib/constants";
import { throwHTTPErrorOrSkip } from "@/lib/http-errors";
import {
  CdpPoRepStatisticsResponse,
  cdpPoRepStatisticsResponseSchema,
} from "@/lib/schemas";
import { assertSchema, objectToURLSearchParams } from "@/lib/utils";
import { numericalStringSchema } from "@/lib/zod-extensions";
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
export type FetchPoRepProvidersParameters = PaginationParameters;
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
              date: z.string().datetime(),
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

// Onboarded data history
export type FetchPoRepOnboardedDataHistoryParameters =
  HistoricalChartParameters;
export type FetchPoRepOnboardedDataHistoryReturnType = z.infer<
  typeof poRepOnboardedDataHistoryResponseSchema
>;

const poRepOnboardedDataHistoryResponseSchema = z.array(
  z.object({
    date: z.string().date(),
    volume: z.string(),
    cumulativeTotal: z.string(),
  })
);

export async function fetchPoRepOnboardedDataHistory(
  parameters: FetchPoRepOnboardedDataHistoryParameters = {}
): Promise<FetchPoRepOnboardedDataHistoryReturnType> {
  const searchParams = objectToURLSearchParams(parameters, true);
  const endpoint = `${CDP_API_URL}/po-rep/onboarded-data-history?${searchParams.toString()}`;
  const response = await fetch(endpoint);

  throwHTTPErrorOrSkip(
    response,
    `CDP API returned response status "${response.status}" when fetching Po-Rep onboarded data history; URL: ${endpoint}`
  );

  const json = await response.json();

  assertSchema(
    json,
    poRepOnboardedDataHistoryResponseSchema,
    `Invalid response from CDP API when fetching Po-Rep onboarded data history; URL: ${endpoint}`
  );

  return json;
}

// Deals value history
export type FetchPoRepDealsValueHistoryParameters = HistoricalChartParameters;
export type FetchPoRepDealsValueHistoryReturnType = z.infer<
  typeof poRepDealsValueHistoryResponseSchema
>;

const poRepDealsValueHistoryResponseSchema = z.array(
  z.object({
    date: z.string().date(),
    volumeUSD: z.number(),
    cumulativeTotalUSD: z.number(),
  })
);

export async function fetchPoRepDealsValueHistory(
  parameters: FetchPoRepDealsValueHistoryParameters = {}
): Promise<FetchPoRepDealsValueHistoryReturnType> {
  const searchParams = objectToURLSearchParams(parameters, true);
  const endpoint = `${CDP_API_URL}/po-rep/deals-value-history?${searchParams.toString()}`;
  const response = await fetch(endpoint);

  throwHTTPErrorOrSkip(
    response,
    `CDP API returned response status "${response.status}" when fetching Po-Rep deals value history; URL: ${endpoint}`
  );

  const json = await response.json();

  assertSchema(
    json,
    poRepDealsValueHistoryResponseSchema,
    `Invalid response from CDP API when fetching Po-Rep deals value history; URL: ${endpoint}`
  );

  return json;
}

// Payments history
export type FetchPoRepPaymentsHistoryParameters = HistoricalChartParameters;
export type FetchPoRepPaymentsHistoryReturnType = z.infer<
  typeof poRepPaymentsHistoryResponseSchema
>;

const poRepPaymentsHistoryResponseSchema = z.array(
  z.object({
    date: z.string().date(),
    dailyAmountUSD: z.number(),
    cumulativeAmountUSD: z.number(),
  })
);

export async function fetchPoRepPaymentsHistory(
  parameters: FetchPoRepPaymentsHistoryParameters = {}
): Promise<FetchPoRepPaymentsHistoryReturnType> {
  const searchParams = objectToURLSearchParams(parameters, true);
  const endpoint = `${CDP_API_URL}/po-rep/payments-history?${searchParams.toString()}`;
  const response = await fetch(endpoint);

  throwHTTPErrorOrSkip(
    response,
    `CDP API returned response status "${response.status}" when fetchin Po-Rep payments history; URL: ${endpoint}`
  );

  const json = await response.json();

  assertSchema(
    json,
    poRepPaymentsHistoryResponseSchema,
    `Invalid response from CDP API when fetching Po-Rep payments history; URL: ${endpoint}`
  );

  return json;
}
