import z from "zod";
import { CDP_API_URL } from "./constants";
import { createJsonFetcher } from "./data-loading";
import { type F0IdInput } from "./f0-id";
import { type ArrayElement, objectToURLSearchParams } from "./utils";
import { numericalStringSchema } from "./zod-extensions";

// Generic types
interface PaginationParameters {
  page?: number;
  limit?: number;
}

type SortingParameters<T extends string = string> = {
  sort?: T;
  order?: "asc" | "desc";
};

// Generaic schema
const paginationSchema = z.object({
  page: z.number(),
  pagesCount: z.number(),
  totalCount: z.number(),
});

const poRepDealSchema = z.object({
  dealId: numericalStringSchema,
  minRequiredRetrievability: z.number().nullable(),
  minRequiredBandwidthMbps: z.number().nullable(),
  maxRequiredLatencyMs: z.number().nullable(),
  minRequiredIndexing: z.number().nullable(),
  predictedAverageRetrievability: z.number().nullable(),
  predictedAverageBandwidthMbps: z.number().nullable(),
  predictedAverageLatencyMs: z.number().nullable(),
  predictedAverageIndexing: z.number().nullable(),
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
  context: "[CDP][Po Rep deals list]",
});

// Provider deals compliance statistics
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
});
