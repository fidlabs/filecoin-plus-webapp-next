import z from "zod";
import { CDP_API_URL } from "./constants";
import { createJsonFetcher } from "./data-loading";
import { type F0IdInput } from "./f0-id";
import { type ArrayElement, objectToURLSearchParams } from "./utils";
import {
  f0IdInputSchema,
  NumericalString,
  numericalStringSchema,
} from "./zod-extensions";

// Generic types
interface PaginationParameters {
  page?: number;
  limit?: number;
}

type SortingParameters<T extends string = string> = {
  sort?: T;
  order?: "asc" | "desc";
};

interface HistoricalChartParameters {
  windowSize?: "day" | "week" | "month";
}

export enum PoRepDealState {
  PROPOSED = "PROPOSED",
  ACCEPTED = "ACCEPTED",
  COMPLETED = "COMPLETED",
  TERMINATED = "TERMINATED",
  REJECTED = "REJECTED",
}

export enum PoRepDealRailState {
  IDLE = "idle",
  ACTIVE = "active",
  TERMINATED = "terminated",
  FINALIZED = "finalized",
}

// Generic schema
const paginationSchema = z.object({
  page: z.number(),
  pagesCount: z.number(),
  totalCount: z.number(),
});

const poRepDealSchema = z.object({
  dealId: numericalStringSchema,
  providerId: f0IdInputSchema,
  clientAddress: z.string(),
  dealState: z.enum(PoRepDealState),
  railId: numericalStringSchema.nullable(),
  railState: z.enum(PoRepDealRailState).nullable(),
  active: z.boolean(),
  tokenAddress: z.string().nullable(),
  tokenSymbol: z.string().nullable(),
  tokenDecimals: z.number().nullable(),
  minRequiredRetrievability: z.number().nullable(),
  minRequiredBandwidthMbps: z.number().nullable(),
  maxRequiredLatencyMs: z.number().nullable(),
  minRequiredIndexing: z.number().nullable(),
  predictedAverageRetrievability: z.number().nullable(),
  predictedAverageBandwidthMbps: z.number().nullable(),
  predictedAverageLatencyMs: z.number().nullable(),
  predictedAverageIndexing: z.number().nullable(),
  dealSizeBytes: numericalStringSchema,
  isDataOnboarded: z.boolean(),
  pricePerSectorPerMonthWei: numericalStringSchema,
  predictedDealRevenueWei: numericalStringSchema,
  totalSettledValueWei: numericalStringSchema.nullable(),
  settlementsCount: z.number().nullable(),
  lastSettlementAt: z.iso.datetime().nullable(),
  dealCreatedAtEpoch: numericalStringSchema,
  dealCreatedAt: z.iso.datetime(),
});

// Po Rep Deals list
export type PoRepDealsListParameters = PaginationParameters &
  SortingParameters<ArrayElement<typeof poRepDealsListSortingKeys>> & {
    activeOnly?: boolean;
    providerId?: F0IdInput;
    railState?: ArrayElement<typeof poRepDealsListRailStateFilters>;
  };

export type PoRepDealsList = z.infer<typeof poRepDealsListSchema>;

export const poRepDealsListSortingKeys = [
  "deal_id",
  "deal_size_bytes",
  "predicted_deal_revenue",
  "total_amount_settled",
  "total_settlements_count",
];

export const poRepDealsListRailStateFilters = [
  "finalized",
  "terminated",
  "active",
  "idle",
];

const poRepDealsListSchema = z.object({
  data: z.array(poRepDealSchema),
  pagination: paginationSchema,
});

export const fetchPoRepDealsList = createJsonFetcher({
  url(parameters: PoRepDealsListParameters) {
    return (
      `${CDP_API_URL}/po-rep/deals?` +
      objectToURLSearchParams(parameters, true).toString()
    );
  },
  schema: poRepDealsListSchema,
  context: "[CDP][Po-Rep deals list]",
});

// SLI Compliance History
export type PoRepSliComplianceHistoryParameters = HistoricalChartParameters & {
  dealId?: NumericalString | bigint | number;
  providerId?: F0IdInput;
  sliType?: "retrievabilityBps" | "bandwidthMbps" | "latencyMs" | "indexingPct";
};

export type PoRepSliComplianceHistory = z.infer<
  typeof poRepSliComplianceHistoryResponseSchema
>;

const poRepSliComplianceHistoryResponseSchema = z.array(
  z.intersection(
    z.object({
      date: z.iso.date(),
    }),
    z.record(
      z.enum(["compliant", "nonCompliant", "unknown"]),
      z.object({
        providersCount: z.number(),
        providersPercentage: z.number(),
        dealsCount: z.number(),
        dealsPercentage: z.number(),
        totalDealsSize: numericalStringSchema,
        totalDealsSizePercentage: z.number(),
      })
    )
  )
);

export const fetchPoRepSliComplianceHistory = createJsonFetcher({
  url(parameters: PoRepSliComplianceHistoryParameters) {
    const searchParams = objectToURLSearchParams(parameters, true);
    return `${CDP_API_URL}/po-rep/sli-compliance-history?${searchParams.toString()}`;
  },
  schema: poRepSliComplianceHistoryResponseSchema,
  context: "[CDP][Po-Rep SLI Compliance History]",
});

// Po Rep Onboarded Data History
export type PoRepOnboardedDataHistoryParameters = HistoricalChartParameters & {
  providerId?: F0IdInput;
};

const poRepOnboardedDataHistoryResponseSchema = z.array(
  z.object({
    date: z.iso.date(),
    volume: z.string(),
    cumulativeTotal: z.string(),
  })
);

export const fetchPoRepOnboardedDataHistory = createJsonFetcher({
  url(parameters: PoRepOnboardedDataHistoryParameters) {
    const searchParams = objectToURLSearchParams(parameters, true);
    return `${CDP_API_URL}/po-rep/onboarded-data-history?${searchParams.toString()}`;
  },
  schema: poRepOnboardedDataHistoryResponseSchema,
  context: "[CDP][Po-Rep Onboarded Data History]",
});

// Po Rep Deals Revenue History
export interface PoRepDealsValueHistoryParameters
  extends HistoricalChartParameters {
  providerId?: F0IdInput;
}

export type PoRepDealsValueHistory = z.infer<
  typeof poRepDealsValueHistoryResponseSchema
>;

const poRepDealsValueHistoryResponseSchema = z.array(
  z.object({
    date: z.iso.date(),
    volumeUSD: z.number(),
    cumulativeTotalUSD: z.number(),
  })
);

export const fetchPoRepDealsValueHistory = createJsonFetcher({
  url(parameters: PoRepDealsValueHistoryParameters) {
    const searchParams = objectToURLSearchParams(parameters, true);
    return `${CDP_API_URL}/po-rep/deals-value-history?${searchParams.toString()}`;
  },
  schema: poRepDealsValueHistoryResponseSchema,
  context: "[CDP][Po-Rep Deals Value History]",
});

// Po Rep Settlements History
export interface PoRepSettlementsHistoryParameters
  extends HistoricalChartParameters {
  netAmounts?: boolean;
  providerId?: F0IdInput;
}

export type PoRepSettlementsHistory = z.infer<
  typeof poRepSettlementsHistoryResponseSchema
>;

const poRepSettlementsHistoryResponseSchema = z.array(
  z.object({
    date: z.iso.date(),
    volumeUSD: z.number(),
    cumulativeTotalUSD: z.number(),
  })
);

export const fetchPoRepSettlementsHistory = createJsonFetcher({
  url(parameters: PoRepSettlementsHistoryParameters) {
    const searchParams = objectToURLSearchParams(parameters, true);
    return `${CDP_API_URL}/po-rep/payments-history?${searchParams.toString()}`;
  },
  schema: poRepSettlementsHistoryResponseSchema,
  context: "[CDP][Po-Rep Deals Value History]",
});

// Po Rep Provider deals compliance statistics
interface PoRepProviderComplianceStatisticsParameters {
  providerId: F0IdInput;
}

const poRepProviderComplianceStatisticsSchema = z.object({
  totalDealsCount: z.number(),
  activeDealsCount: z.number(),
  compliantDealsPercentage: z.number().nullable(),
  compliantDealsCount: z.number(),
  nonCompliantDealsCount: z.number(),
  unknownDealsCount: z.number(),
});

export const fetchPoRepProviderComplianceStatistics = createJsonFetcher({
  url({ providerId }: PoRepProviderComplianceStatisticsParameters) {
    return `${CDP_API_URL}/po-rep/providers/${providerId}/compliance-stats`;
  },
  schema: poRepProviderComplianceStatisticsSchema,
  context: "[CDP][Po-Rep Provider Compliance Statistics]",
});

// Provider storage statistics
interface PoRepProviderStorageStatisticsParameters {
  providerId: F0IdInput;
}

const poRepProviderStorageStatisticsSchema = z.object({
  totalDealsCount: z.number(),
  onboardedDealsCount: z.number(),
  totalAvailableBytes: numericalStringSchema,
  pendingBytes: numericalStringSchema,
  committedBytes: numericalStringSchema,
  onboardedBytes: numericalStringSchema,
});

export const fetchPoRepProviderStorageStatistics = createJsonFetcher({
  url({ providerId }: PoRepProviderStorageStatisticsParameters) {
    return `${CDP_API_URL}/po-rep/providers/${providerId}/storage-stats`;
  },
  schema: poRepProviderStorageStatisticsSchema,
  context: "[CDP][Po-Rep Provider Storage Statistics]",
});

// Provider economics statistics
interface PoRepProviderEconomicsStatisticsParameters {
  providerId: F0IdInput;
}

const poRepProviderEconomicsStatisticsSchema = z.object({
  totalRailsCount: z.number(),
  activeRailsCount: z.number(),
  totalRevenueUSD: z.number(),
  predictedRevenueUSD: z.number(),
  totalSettledUSD: z.number(),
  lastSettlementAt: z.iso.datetime().nullable(),
});

export const fetchPoRepProviderEcononomicsStatistics = createJsonFetcher({
  url({ providerId }: PoRepProviderEconomicsStatisticsParameters) {
    return `${CDP_API_URL}/po-rep/providers/${providerId}/economics-stats`;
  },
  schema: poRepProviderEconomicsStatisticsSchema,
  context: "[CDP][Po-Rep Provider Economics Statistics]",
});
