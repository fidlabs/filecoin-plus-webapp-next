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
import { numericalStringSchema } from "@/lib/zod-extensions";
import { identity } from "lodash";
import { z, type ZodType } from "zod";

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
  // Uncomment when DDOs are fixed in DMOB database or we migrate to other data source
  // StorageProvidersDashboardStatisticType.DDO_DEALS_PERCENTAGE
  // StorageProvidersDashboardStatisticType.DDO_DEALS_PERCENTAGE_TO_DATE,
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

// Datacap usage info
export type FetchDatacapUsageInfoReturnType = z.infer<
  typeof datacapUsageInfoResponseSchema
>;

const datacapUsageValueSchema = z.object({
  value: numericalStringSchema,
  percentage: z.number(),
});
const datacapUsageInfoResponseSchema = z.object({
  usedDatacap: datacapUsageValueSchema,
  remainingDatacap: datacapUsageValueSchema,
});

export async function fetchDatacapUsageInfo(): Promise<FetchDatacapUsageInfoReturnType> {
  const endpoint = `${CDP_API_URL}/allocators/datacap-usage-info`;
  const response = await fetch(endpoint);

  throwHTTPErrorOrSkip(
    response,
    `CDP API returned status ${response.status} when fetching datacap usage info; URL: ${endpoint}`
  );

  const data = await response.json();

  assertSchema(
    data,
    datacapUsageInfoResponseSchema,
    `Invalid response from CDP when fetching datacap usage info; URL: ${endpoint}`
  );

  return data as FetchDatacapUsageInfoReturnType;
}

// Cumulative allocations history
export type FetchCumulativeAllocationsHistoryReturnType = z.infer<
  typeof cumulativeAllocationsResponseSchema
>;

const cumulativeAllocationsResponseSchema = z.array(
  z.object({
    year: z.number(),
    week: z.number(),
    cumulativeTotal: numericalStringSchema,
  })
);

export async function fetchCumulativeAllocationsHistory(): Promise<FetchCumulativeAllocationsHistoryReturnType> {
  const endpoint = `${CDP_API_URL}/allocators/cumulative-allocations-history`;
  const response = await fetch(endpoint);

  throwHTTPErrorOrSkip(
    response,
    `CDP API returned status ${response.status} when fetching cumulative allocations history; URL: ${endpoint}`
  );

  const data = await response.json();

  assertSchema(
    data,
    cumulativeAllocationsResponseSchema,
    `Invalid response from CDP when fetching cumulative allocations history; URL: ${endpoint}`
  );

  return data as FetchCumulativeAllocationsHistoryReturnType;
}

// Allocations by allocator history
export type FetchAllocationsByAllocatorHistoryReturnType = z.infer<
  typeof allocationsByAllocatorResponseSchema
>;

const allocationsByAllocatorResponseSchema = z.array(
  z.object({
    year: z.number(),
    week: z.number(),
    allocatorId: z.string(),
    allocatorName: z.string().nullable(),
    weekTotal: numericalStringSchema,
  })
);

export async function fetchAllocationsByAllocatorHistory(): Promise<FetchAllocationsByAllocatorHistoryReturnType> {
  const endpoint = `${CDP_API_URL}/allocators/allocations-by-allocator-history`;
  const response = await fetch(endpoint);

  throwHTTPErrorOrSkip(
    response,
    `CDP API returned status ${response.status} when fetching allocations by allocator history; URL: ${endpoint}`
  );

  const data = await response.json();

  assertSchema(
    data,
    allocationsByAllocatorResponseSchema,
    `Invalid response from CDP when fetching allocations by allocator history; URL: ${endpoint}`
  );

  return data as FetchAllocationsByAllocatorHistoryReturnType;
}
