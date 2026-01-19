import { CDP_API_URL } from "@/lib/constants";
import { throwHTTPErrorOrSkip } from "@/lib/http-errors";
import {
  AllocatorsDashboardStatistic,
  AllocatorsDashboardStatisticType,
  cdpAllocatorsStatisticsResponseSchema,
  cdpClientsStatisticsResponseSchema,
  cdpStorageProvidersStatisticsResponseSchema,
  ClientsDashboardStatistic,
  ClientsDashboardStatisticType,
  StorageProvidersDashboardStatistic,
  StorageProvidersDashboardStatisticType,
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

const shownStatisticsTypes: string[] = [
  AllocatorsDashboardStatisticType.TOTAL_APPROVED_ALLOCATORS,
  AllocatorsDashboardStatisticType.TOTAL_ACTIVE_ALLOCATORS,
  AllocatorsDashboardStatisticType.COMPLIANT_ALLOCATORS,
  AllocatorsDashboardStatisticType.NON_COMPLIANT_ALLOCATORS,
  AllocatorsDashboardStatisticType.NUMBER_OF_ALERTS,
  ClientsDashboardStatisticType.DATACAP_SPENT_BY_CLIENTS,
  ClientsDashboardStatisticType.FAILING_CLIENTS,
  ClientsDashboardStatisticType.TOTAL_ACTIVE_CLIENTS,
  ClientsDashboardStatisticType.TOTAL_CLIENTS,
  StorageProvidersDashboardStatisticType.DDO_DEALS_PERCENTAGE,
  StorageProvidersDashboardStatisticType.DDO_DEALS_PERCENTAGE_TO_DATE,
  StorageProvidersDashboardStatisticType.STORAGE_PROVIDERS_REPORTING_TO_IPNI_PERCENTAGE,
  StorageProvidersDashboardStatisticType.STORAGE_PROVIDERS_WITH_HIGH_RPA_PERCENTAGE,
  StorageProvidersDashboardStatisticType.TOTAL_ACTIVE_STORAGE_PROVIDERS,
  StorageProvidersDashboardStatisticType.TOTAL_STORAGE_PROVIDERS,
];

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

  return responses
    .flatMap<DashboardStatistic>(identity)
    .filter((statistic) => shownStatisticsTypes.includes(statistic.type));
}
