import { CDP_API_URL } from "@/lib/constants";
import { throwHTTPErrorOrSkip } from "@/lib/http-errors";
import {
  AllocatorsDashboardStatistic,
  cdpAllocatorsStatisticsResponseSchema,
  cdpClientsStatisticsResponseSchema,
  cdpStorageProvidersStatisticsResponseSchema,
  ClientsDashboardStatistic,
  StorageProvidersDashboardStatistic,
} from "@/lib/schemas";
import { assertSchema, objectToURLSearchParams } from "@/lib/utils";
import { identity } from "lodash";
import { type ZodType } from "zod";

type DashboardStatistic =
  | AllocatorsDashboardStatistic
  | ClientsDashboardStatistic
  | StorageProvidersDashboardStatistic;

export interface FetchDashboardStatisticsParameters {
  interval?: "day" | "week" | "month";
}

export type FetchDashboardStatisticsReturnType = DashboardStatistic[];

function resolveResponse<T>(schema: ZodType<T>) {
  return async function resolveResponseInner(response: Response): Promise<T> {
    throwHTTPErrorOrSkip(response);
    const json = await response.json();
    assertSchema(json, schema);
    return json;
  };
}

export async function fetchDashboardStatistics(
  parameters?: FetchDashboardStatisticsParameters
): Promise<FetchDashboardStatisticsReturnType> {
  const searchParams = objectToURLSearchParams(parameters ?? {});
  const responses = await Promise.all([
    fetch(
      `${CDP_API_URL}/allocators/statistics?${searchParams.toString()}`
    ).then(resolveResponse(cdpAllocatorsStatisticsResponseSchema)),
    fetch(`${CDP_API_URL}/clients/statistics?${searchParams.toString()}`).then(
      resolveResponse(cdpClientsStatisticsResponseSchema)
    ),
    fetch(
      `${CDP_API_URL}/storage-providers/statistics?${searchParams.toString()}`
    ).then(resolveResponse(cdpStorageProvidersStatisticsResponseSchema)),
  ]);

  return responses.flatMap<DashboardStatistic>(identity);
}
