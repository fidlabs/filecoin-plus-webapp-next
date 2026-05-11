import { CDP_API_URL } from "@/lib/constants";
import { throwHTTPErrorOrSkip } from "@/lib/http-errors";
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
    `CDP API returned response status "${response.status}" when fetchin Po-Rep Providers; URL: ${endpoint}`
  );

  const json = await response.json();

  assertSchema(
    json,
    poRepProvidersResponseSchema,
    `Invalid response from CDP API when fetching Po-Rep Providers; URL: ${endpoint}`
  );

  return json as FetchPoRepProvidersReturnType;
}
