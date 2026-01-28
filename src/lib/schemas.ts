import { z } from "zod";

export const dashboardStatisticBigintValueSchema = z.object({
  value: z.string(),
  type: z.literal("bigint"),
});
export type DashboardStatisticBigintValue = z.infer<
  typeof dashboardStatisticBigintValueSchema
>;

export const dashboardStatisticNumericValueSchema = z.object({
  value: z.number(),
  type: z.literal("numeric"),
});
export type DashboardStatisticNumericValue = z.infer<
  typeof dashboardStatisticNumericValueSchema
>;

export const dashboardStatisticPercentageValueSchema = z.object({
  value: z.number(),
  type: z.literal("percentage"),
});
export type DashboardStatisticPercentageValue = z.infer<
  typeof dashboardStatisticPercentageValueSchema
>;

export const dashboardStatisticDurationValueSchema = z.object({
  value: z.number(),
  unit: z.enum([
    "millisecond",
    "second",
    "minute",
    "hour",
    "day",
    "week",
    "month",
    "year",
  ]),
  type: z.literal("duration"),
});
export type DashboardStatisticDurationValue = z.infer<
  typeof dashboardStatisticDurationValueSchema
>;

export const dashboardStatisticValueSchema = z.union([
  dashboardStatisticBigintValueSchema,
  dashboardStatisticNumericValueSchema,
  dashboardStatisticPercentageValueSchema,
  dashboardStatisticDurationValueSchema,
]);
export type DashboardStatisticValue = z.infer<
  typeof dashboardStatisticValueSchema
>;

export const dashboardStatisticSchema = z.object({
  title: z.string(),
  description: z.string().nullable(),
  value: dashboardStatisticValueSchema,
  percentageChange: z
    .object({
      value: z.number(),
      interval: z.enum(["day", "week", "month"]),
      increaseNegative: z.boolean(),
    })
    .nullable(),
});
export type DashboardStatistic = z.infer<typeof dashboardStatisticSchema>;

export enum AllocatorsDashboardStatisticType {
  TOTAL_APPROVED_ALLOCATORS = "TOTAL_APPROVED_ALLOCATORS",
  TOTAL_ACTIVE_ALLOCATORS = "TOTAL_ACTIVE_ALLOCATORS",
  COMPLIANT_ALLOCATORS = "COMPLIANT_ALLOCATORS",
  NON_COMPLIANT_ALLOCATORS = "NON_COMPLIANT_ALLOCATORS",
  NUMBER_OF_ALERTS = "NUMBER_OF_ALERTS",
  AVERAGE_NUMBER_OF_CLIENTS = "AVERAGE_NUMBER_OF_CLIENTS",
  AVERAGE_PERCENTAGE_OF_RETURNING_CLIENTS = "AVERAGE_PERCENTAGE_OF_RETURNING_CLIENTS",
  AVERAGE_TIME_TO_FIRST_DEAL = "AVERAGE_TIME_TO_FIRST_DEAL",
}

export const allocatorsDashboardStatisticSchema = z.intersection(
  dashboardStatisticSchema,
  z.object({
    type: z.string(),
  })
);
export type AllocatorsDashboardStatistic = z.infer<
  typeof allocatorsDashboardStatisticSchema
>;

export enum ClientsDashboardStatisticType {
  TOTAL_CLIENTS = "TOTAL_CLIENTS",
  TOTAL_ACTIVE_CLIENTS = "TOTAL_ACTIVE_CLIENTS",
  FAILING_CLIENTS = "FAILING_CLIENTS",
  DATACAP_SPENT_BY_CLIENTS = "DATACAP_SPENT_BY_CLIENTS",
  CLIENTS_WITH_ACTIVE_DEALS = "CLIENTS_WITH_ACTIVE_DEALS",
  CLIENTS_WITH_ACTIVE_DEALS_AND_DATACAP = "CLIENTS_WITH_ACTIVE_DEALS_AND_DATACAP",
  TOTAL_REMAINING_CLIENTS_DATACAP = "TOTAL_REMAINING_CLIENTS_DATACAP",
}

export const clientsDashboardStatisticSchema = z.intersection(
  dashboardStatisticSchema,
  z.object({
    type: z.string(),
  })
);
export type ClientsDashboardStatistic = z.infer<
  typeof clientsDashboardStatisticSchema
>;

export enum StorageProvidersDashboardStatisticType {
  TOTAL_STORAGE_PROVIDERS = "TOTAL_STORAGE_PROVIDERS",
  TOTAL_ACTIVE_STORAGE_PROVIDERS = "TOTAL_ACTIVE_STORAGE_PROVIDERS",
  STORAGE_PROVIDERS_WITH_HIGH_RPA_PERCENTAGE = "STORAGE_PROVIDERS_WITH_HIGH_RPA_PERCENTAGE",
  STORAGE_PROVIDERS_REPORTING_TO_IPNI_PERCENTAGE = "STORAGE_PROVIDERS_REPORTING_TO_IPNI_PERCENTAGE",
  DDO_DEALS_PERCENTAGE = "DDO_DEALS_PERCENTAGE",
  DDO_DEALS_PERCENTAGE_TO_DATE = "DDO_DEALS_PERCENTAGE_TO_DATE",
  AVERAGE_URL_FINDER_RETRIEVABILITY_PERCENTAGE = "AVERAGE_URL_FINDER_RETRIEVABILITY_PERCENTAGE",
  AVERAGE_AVAILABLE_URL_FINDER_RETRIEVABILITY_PERCENTAGE = "AVERAGE_AVAILABLE_URL_FINDER_RETRIEVABILITY_PERCENTAGE",
}

export const storageProvidersDashboardStatisticSchema = z.intersection(
  dashboardStatisticSchema,
  z.object({
    type: z.string(),
  })
);
export type StorageProvidersDashboardStatistic = z.infer<
  typeof storageProvidersDashboardStatisticSchema
>;

export const cdpAllocatorsStatisticsResponseSchema = z.array(
  allocatorsDashboardStatisticSchema
);
export type CdpAllocatorsStatisticsResponse = z.infer<
  typeof cdpAllocatorsStatisticsResponseSchema
>;

export const cdpClientsStatisticsResponseSchema = z.array(
  allocatorsDashboardStatisticSchema
);
export type CdpClientstatisticsResponse = z.infer<
  typeof cdpClientsStatisticsResponseSchema
>;

export const cdpStorageProvidersStatisticsResponseSchema = z.array(
  allocatorsDashboardStatisticSchema
);
export type CdpStorageProvidersStatisticsResponse = z.infer<
  typeof cdpStorageProvidersStatisticsResponseSchema
>;
