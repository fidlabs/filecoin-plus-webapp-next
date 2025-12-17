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

export const dashboardStatisticValueSchema = z.union([
  dashboardStatisticBigintValueSchema,
  dashboardStatisticNumericValueSchema,
  dashboardStatisticPercentageValueSchema,
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
    })
    .nullable(),
});
export type DashboardStatistic = z.infer<typeof dashboardStatisticSchema>;

export const allocatorsDashboardStatisticSchema = z.intersection(
  dashboardStatisticSchema,
  z.object({
    type: z.string(),
  })
);
export type AllocatorsDashboardStatistic = z.infer<
  typeof allocatorsDashboardStatisticSchema
>;

export const clientsDashboardStatisticSchema = z.intersection(
  dashboardStatisticSchema,
  z.object({
    type: z.string(),
  })
);
export type ClientsDashboardStatistic = z.infer<
  typeof clientsDashboardStatisticSchema
>;

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
