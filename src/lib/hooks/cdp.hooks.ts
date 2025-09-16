import {
  ICDPHistogram,
  ICDPHistogramResult,
  ICDPUnifiedHistogram,
} from "@/lib/interfaces/cdp/cdp.interface";
import { useCallback, useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { CDP_API_URL } from "../constants";
import { useEditionRound } from "../providers/edition-round-provider";
import { dateToYearWeek, groupBy, mapObject } from "../utils";
import { numericalStringSchema } from "../zod-extensions";
import { fetchData } from "../api";
import useSWR from "swr";

type AllocatorSPSComplianceMetric =
  (typeof allocatorSPsComplianceMetrics)[number];

type ChartDataItem<T extends string> = {
  name: string;
} & {
  [K in T]: number;
} & {
  [K in T as `${T}Name`]: string;
};

const allocatorSPsComplianceMetrics = [
  "compliant",
  "partiallyCompliant",
  "nonCompliant",
] as const;

interface UseStorageProviderRetrievabilityParameters {
  httpRetrievability?: boolean;
  openDataOnly?: boolean;
}

const useStorageProviderRetrievability = ({
  httpRetrievability = false,
  openDataOnly = false,
}: UseStorageProviderRetrievabilityParameters) => {
  const { selectedRoundId } = useEditionRound();

  const fetchData = useCallback(async () => {
    const searchParams = new URLSearchParams();
    searchParams.set("httpRetrievability", String(httpRetrievability));
    searchParams.set("openDataOnly", String(openDataOnly));

    if (selectedRoundId) searchParams.set("editionId", selectedRoundId);

    const endpoint = `/stats/acc/providers/retrievability?${searchParams.toString()}`;
    const response = await fetch(`${CDP_API_URL}${endpoint}`);
    const data = (await response.json()) as ICDPHistogramResult;
    return {
      avgSuccessRatePct: data?.averageSuccessRate,
      count: data?.histogram?.total,
      buckets: data?.histogram?.results,
    } as ICDPUnifiedHistogram;
  }, [httpRetrievability, openDataOnly, selectedRoundId]);

  const [data, setData] = useState<ICDPUnifiedHistogram | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setData(undefined);
    setIsLoading(true);
    fetchData()
      .then(setData)
      .then(() => setIsLoading(false));
  }, [fetchData]);

  return {
    data,
    isLoading,
  };
};

const useStorageProviderNumberOfDeals = () => {
  const { selectedRoundId } = useEditionRound();

  const fetchData = useCallback(async () => {
    const searchParams = new URLSearchParams();
    if (selectedRoundId) searchParams.set("editionId", selectedRoundId);

    const response = await fetch(
      `${CDP_API_URL}/stats/acc/providers/clients?${searchParams.toString()}`
    );
    const data = (await response.json()) as ICDPHistogram;
    return {
      count: data?.total,
      buckets: data?.results,
    } as ICDPUnifiedHistogram;
  }, [selectedRoundId]);

  const [data, setData] = useState<ICDPUnifiedHistogram | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    fetchData()
      .then(setData)
      .then(() => setIsLoading(false));
  }, [fetchData, selectedRoundId]);

  return {
    data,
    isLoading,
  };
};

const useStorageProviderBiggestDeal = () => {
  const { selectedRoundId } = useEditionRound();

  const fetchData = useCallback(async () => {
    const searchParams = new URLSearchParams();
    if (selectedRoundId) searchParams.set("editionId", selectedRoundId);

    const response = await fetch(
      `${CDP_API_URL}/stats/acc/providers/biggest-client-distribution?${searchParams.toString()}`
    );
    const data = (await response.json()) as ICDPHistogram;
    return {
      count: data?.total,
      buckets: data?.results,
    } as ICDPUnifiedHistogram;
  }, [selectedRoundId]);

  const [data, setData] = useState<ICDPUnifiedHistogram | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    fetchData()
      .then(setData)
      .then(() => setIsLoading(false));
  }, [fetchData, selectedRoundId]);

  return {
    data,
    isLoading,
  };
};

interface UseAllocatorRetrievabilityParameters {
  httpRetrievability?: boolean;
  openDataOnly?: boolean;
}

const useAllocatorRetrievability = ({
  httpRetrievability = false,
  openDataOnly = false,
}: UseAllocatorRetrievabilityParameters) => {
  const { selectedRoundId } = useEditionRound();

  const fetchData = useCallback(async () => {
    const searchParams = new URLSearchParams();
    searchParams.set("httpRetrievability", String(httpRetrievability));
    searchParams.set("openDataOnly", String(openDataOnly));
    if (selectedRoundId) searchParams.set("editionId", selectedRoundId);

    const endpoint = `/stats/acc/allocators/retrievability?${searchParams.toString()}`;
    const response = await fetch(`${CDP_API_URL}${endpoint}`);
    const data = (await response.json()) as ICDPHistogramResult;

    return {
      avgSuccessRatePct: data?.averageSuccessRate,
      count: data?.histogram?.total,
      buckets: data?.histogram?.results,
    } as ICDPUnifiedHistogram;
  }, [httpRetrievability, openDataOnly, selectedRoundId]);

  const [data, setData] = useState<ICDPUnifiedHistogram | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setData(undefined);
    fetchData()
      .then(setData)
      .then(() => setIsLoading(false));
  }, [fetchData]);

  return {
    data,
    isLoading,
  };
};

const useAllocatorBiggestDeal = () => {
  const { selectedRoundId } = useEditionRound();

  const fetchData = useCallback(async () => {
    const searchParams = new URLSearchParams();
    if (selectedRoundId) searchParams.set("editionId", selectedRoundId);

    const response = await fetch(
      `${CDP_API_URL}/stats/acc/allocators/biggest-client-distribution?${searchParams.toString()}`
    );
    const data = (await response.json()) as ICDPHistogram;
    return {
      count: data?.total,
      buckets: data?.results,
    } as ICDPUnifiedHistogram;
  }, [selectedRoundId]);

  const [data, setData] = useState<ICDPUnifiedHistogram | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    fetchData()
      .then(setData)
      .then(() => setIsLoading(false));
  }, [fetchData, selectedRoundId]);

  return {
    data,
    isLoading,
  };
};

export const useAllocatorAndSPClientDiversity = (options: {
  mode?: "count" | "dc";
  apiMode: "allocators" | "providers";
  threshold: number[];
  asPercentage?: boolean;
}) => {
  const { threshold, mode = "count", asPercentage = false, apiMode } = options;

  const { selectedRoundId } = useEditionRound();

  const [data, setData] = useState<ICDPUnifiedHistogram | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = useCallback(async () => {
    const searchParams = new URLSearchParams();
    if (selectedRoundId) searchParams.set("editionId", selectedRoundId);

    const response = await fetch(
      `${CDP_API_URL}/stats/acc/${apiMode}/clients?${searchParams.toString()}`
    );
    const data = (await response.json()) as ICDPHistogram;
    return {
      count: data?.total,
      buckets: data?.results,
    } as ICDPUnifiedHistogram;
  }, [apiMode, selectedRoundId]);

  useEffect(() => {
    setIsLoading(true);
    fetchData()
      .then(setData)
      .then(() => setIsLoading(false));
  }, [fetchData]);

  const chartData = useMemo(() => {
    if (!data) {
      return [];
    }

    return data.buckets.map((result) => {
      const date = new Date(result.week);

      const nonCompliant = result.results
        .filter((range) => range.valueToInclusive <= threshold[0])
        .reduce(
          (sum, range) =>
            sum + (mode === "count" ? range.count : +range.totalDatacap),
          0
        );

      const partiallyCompliant = result.results
        .filter(
          (range) =>
            threshold[0] < range.valueFromExclusive &&
            range.valueToInclusive <= threshold[1]
        )
        .reduce(
          (sum, range) =>
            sum + (mode === "count" ? range.count : +range.totalDatacap),
          0
        );

      const compliant = result.results
        .filter((range) => range.valueFromExclusive > threshold[1])
        .reduce(
          (sum, range) =>
            sum + (mode === "count" ? range.count : +range.totalDatacap),
          0
        );

      const total = nonCompliant + partiallyCompliant + compliant;

      return {
        name: dateToYearWeek(date),
        nonCompliant: asPercentage
          ? (nonCompliant / total) * 100
          : nonCompliant,
        partiallyCompliant: asPercentage
          ? (partiallyCompliant / total) * 100
          : partiallyCompliant,
        compliant: asPercentage ? (compliant / total) * 100 : compliant,
        compliantName: "High clients count",
        partiallyCompliantName: "Average clients count",
        nonCompliantName: "Low clients count",
      };
    });
  }, [data, mode, asPercentage, threshold]);

  return {
    chartData,
    isLoading,
  };
};

export function useAllocatorSPComplianceChartData(options: {
  mode?: "count" | "dc";
  threshold: number;
  asPercentage?: boolean;
  retrievabilityMetric: boolean;
  numberOfClientsMetric: boolean;
  totalDealSizeMetric: boolean;
}) {
  type CharItem = ChartDataItem<AllocatorSPSComplianceMetric>;
  type ChartData = CharItem[];
  type WeekResult = CDPAllocatorsSPsComplianceData["results"][number];
  type AllocatorData = WeekResult["allocators"][number];

  const { selectedRoundId } = useEditionRound();

  const { threshold, mode = "count", asPercentage = false } = options;
  const [data, setData] = useState<CDPAllocatorsSPsComplianceData>();
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState(false);

  const loadData = useCallback(async () => {
    setError(undefined);
    setIsLoading(true);

    const fetchOptions = new URLSearchParams();

    fetchOptions.append(
      "retrievability",
      options?.retrievabilityMetric ? "true" : "false"
    );
    fetchOptions.append(
      "numberOfClients",
      options?.numberOfClientsMetric ? "true" : "false"
    );
    fetchOptions.append(
      "totalDealSize",
      options?.totalDealSizeMetric ? "true" : "false"
    );

    if (selectedRoundId) fetchOptions.append("roundId", selectedRoundId);

    try {
      const response = await fetch(
        `${CDP_API_URL}/stats/acc/allocators/sps-compliance?${fetchOptions.toString()}`
      );

      const json = await response.json();
      assertIsAllocatorsSPsComplianceData(json);

      setData(json);
    } catch (error) {
      setError(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsLoading(false);
    }
  }, [
    options?.numberOfClientsMetric,
    options?.retrievabilityMetric,
    options?.totalDealSizeMetric,
    selectedRoundId,
  ]);

  useEffect(() => {
    loadData();
  }, [loadData, selectedRoundId]);

  const getComplianceByTreshold = useCallback(
    (allocatorData: AllocatorData): AllocatorSPSComplianceMetric => {
      const { compliantSpsPercentage, partiallyCompliantSpsPercentage } =
        allocatorData;

      if (compliantSpsPercentage >= threshold) {
        return "compliant";
      } else if (
        partiallyCompliantSpsPercentage + compliantSpsPercentage >=
        threshold
      ) {
        return "partiallyCompliant" as AllocatorSPSComplianceMetric;
      } else {
        return "nonCompliant" as AllocatorSPSComplianceMetric;
      }
    },
    [threshold]
  );

  const getChartValue = useCallback(
    (allocatorsData: AllocatorData[], total: bigint): number => {
      const value =
        mode === "count"
          ? BigInt(allocatorsData.length)
          : allocatorsData.reduce((sumOfDatacap, allocator) => {
              return sumOfDatacap + BigInt(allocator.totalDatacap);
            }, 0n);

      return asPercentage ? bigintToPercentage(value, total, 6) : Number(value);
    },
    [asPercentage, mode]
  );

  const chartData = useMemo<ChartData>(() => {
    if (!data) {
      return [];
    }

    return data.results.map((result) => {
      const date = new Date(result.week);
      const total =
        mode === "count"
          ? BigInt(result.allocators.length)
          : result.allocators.reduce((sumOfDatacap, allocator) => {
              return sumOfDatacap + BigInt(allocator.totalDatacap);
            }, 0n);
      const grouped = groupBy(
        result.allocators,
        getComplianceByTreshold,
        allocatorSPsComplianceMetrics
      );
      const values = mapObject(grouped, (allocators) =>
        getChartValue(allocators, total)
      );

      return {
        name: dateToYearWeek(date),
        ...values,
        compliantName: "Compliant",
        partiallyCompliantName: "Partially Compliant",
        nonCompliantName: "Non Compliant",
      };
    });
  }, [data, getChartValue, getComplianceByTreshold, mode]);

  return {
    averageSuccessRate: data?.averageSuccessRate,
    chartData,
    error,
    isLoading,
  };
}

export function useProvidersComplianceChartData(options?: {
  mode?: "count" | "dc";
  asPercentage?: boolean;
  retrievabilityMetric: boolean;
  numberOfClientsMetric: boolean;
  totalDealSizeMetric: boolean;
}) {
  type Item = ChartDataItem<AllocatorSPSComplianceMetric>;
  type ChartData = Item[];

  const { mode = "count", asPercentage = false } = options ?? {};
  const [data, setData] = useState<CDPProvidersComplianceData>();
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState(false);
  const { selectedRoundId } = useEditionRound();

  const loadData = useCallback(async () => {
    setError(undefined);
    setIsLoading(true);

    const fetchOptions = new URLSearchParams();
    fetchOptions.append(
      "retrievability",
      options?.retrievabilityMetric ? "true" : "false"
    );
    fetchOptions.append(
      "numberOfClients",
      options?.numberOfClientsMetric ? "true" : "false"
    );
    fetchOptions.append(
      "totalDealSize",
      options?.totalDealSizeMetric ? "true" : "false"
    );

    if (selectedRoundId) fetchOptions.append("roundId", selectedRoundId);

    try {
      const response = await fetch(
        `${CDP_API_URL}/stats/acc/providers/compliance-data?${fetchOptions.toString()}`
      );

      const json = await response.json();
      assertIsProvidersComplianceData(json);

      setData(json);
    } catch (error) {
      setError(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsLoading(false);
    }
  }, [
    options?.numberOfClientsMetric,
    options?.retrievabilityMetric,
    options?.totalDealSizeMetric,
    selectedRoundId,
  ]);

  useEffect(() => {
    loadData();
  }, [loadData, selectedRoundId]);

  const chartData = useMemo<ChartData>(() => {
    if (!data) {
      return [];
    }

    return data.results.map((result) => {
      const name = dateToYearWeek(result.week);
      const values: [bigint, bigint, bigint] =
        mode === "count"
          ? [
              BigInt(result.compliantSps),
              BigInt(result.partiallyCompliantSps),
              BigInt(result.nonCompliantSps),
            ]
          : [
              BigInt(result.compliantSpsTotalDatacap),
              BigInt(result.partiallyCompliantSpsTotalDatacap),
              BigInt(result.nonCompliantSpsTotalDatacap),
            ];

      const total = values.reduce((sum, value) => sum + value, 0n);

      const [compliant, partiallyCompliant, nonCompliant] = values.map(
        (value) => {
          if (asPercentage) {
            return bigintToPercentage(value, total, 6);
          }

          return Number(value);
        }
      );

      return {
        name,
        compliant,
        compliantName: "Compliant",
        partiallyCompliant,
        partiallyCompliantName: "Partially Compliant",
        nonCompliant,
        nonCompliantName: "Non Compliant",
      };
    });
  }, [asPercentage, data, mode]);

  return {
    averageSuccessRate: data?.averageSuccessRate,
    chartData,
    error,
    isLoading,
  };
}

const providersComplianceDataSchema = z.object({
  averageSuccessRate: z.number(),
  results: z.array(
    z.object({
      week: z.string(),
      averageSuccessRate: z.number(),
      compliantSps: z.number(),
      partiallyCompliantSps: z.number(),
      nonCompliantSps: z.number(),
      totalSps: z.number(),
      compliantSpsTotalDatacap: z.union([z.number(), z.string()]),
      partiallyCompliantSpsTotalDatacap: z.union([z.number(), z.string()]),
      nonCompliantSpsTotalDatacap: z.union([z.number(), z.string()]),
    })
  ),
});

export type CDPProvidersComplianceData = z.infer<
  typeof providersComplianceDataSchema
>;

function assertIsProvidersComplianceData(
  input: unknown
): asserts input is CDPProvidersComplianceData {
  const result = providersComplianceDataSchema.safeParse(input);

  if (!result.success) {
    throw new TypeError(
      "Invalid response from CDP when fetching providers compliance data"
    );
  }
}

const allocatorsSPsComplianceDataSchema = z.object({
  averageSuccessRate: z.number(),
  results: z.array(
    z.object({
      week: z.string(),
      averageSuccessRate: z.number(),
      allocators: z.array(
        z.object({
          compliantSpsPercentage: z.number(),
          partiallyCompliantSpsPercentage: z.number(),
          nonCompliantSpsPercentage: z.number(),
          totalSps: z.number(),
          totalDatacap: z.union([z.string(), z.number()]),
        })
      ),
    })
  ),
});

export type CDPAllocatorsSPsComplianceData = z.infer<
  typeof allocatorsSPsComplianceDataSchema
>;

function assertIsAllocatorsSPsComplianceData(
  input: unknown
): asserts input is CDPAllocatorsSPsComplianceData {
  const result = allocatorsSPsComplianceDataSchema.safeParse(input);

  if (!result.success) {
    throw new TypeError(
      "Invalid response from CDP when fetching allocators SPs compliance data"
    );
  }
}

function bigintToPercentage(
  numerator: bigint,
  denominator: bigint,
  precision = 2
): number {
  if (denominator === 0n) {
    return 0;
  }

  const precisionExponent = 10n ** BigInt(2 + precision);
  const numeratorWithPrecision = numerator * precisionExponent;
  const fraction = numeratorWithPrecision / denominator;

  return Number(fraction) / Math.pow(10, precision);
}

const allocatorsDCFlowSchema = z.object({
  cutoffDate: z.string().datetime(),
  filPlusEditionId: z.number(),
  data: z.array(
    z.object({
      metapathwayType: z.enum(["MDMA", "RKH", "AMA", "ORMA"]).nullable(),
      applicationAudit: z
        .enum([
          "Public Open",
          "Enterprise Data",
          "Automated Allocator",
          "Other",
          "Automated",
        ])
        .nullable(),
      pathway: z
        .enum([
          "Manual",
          "Automatic",
          "Automated", // For some reason this applies only to Faucet
          "Market-based",
          "RFA",
          "Manual Pathway MetaAllocator",
          "Experimental Pathway MetaAllocator",
        ])
        .nullable(),
      typeOfAllocator: z
        .enum([
          "Manual Pathway MetaAllocator",
          "Manual",
          "Automatic",
          "Automated", // For some reason this applies only to Faucet
          "Market-based",
          "RFA",
          "Novel allocator not on RFA",
        ])
        .nullable(),
      allocatorId: z.string(),
      datacap: numericalStringSchema,
      allocatorName: z.string().nullable(),
    })
  ),
});

export type AllocatorsDCFlowData = z.infer<typeof allocatorsDCFlowSchema>;

function assertIsAllocatorsDCFlowData(
  input: unknown
): asserts input is AllocatorsDCFlowData {
  const result = allocatorsDCFlowSchema.safeParse(input);

  if (!result.success) {
    throw new TypeError(
      "Invalid response from CDP when fetching allocators DC Flow"
    );
  }
}

export function useAllocatorsDCFlow(cutoffDate?: Date) {
  const fetcher = useCallback(async (url: string) => {
    const response = await fetchData(url);
    assertIsAllocatorsDCFlowData(response);
    return response;
  }, []);

  const params = new URLSearchParams();
  params.set("showInactive", "false");

  if (cutoffDate) {
    params.set("cutoffDate", cutoffDate.toISOString());
  }

  const url = `${CDP_API_URL}/allocators/dc-flow?${params.toString()}`;
  const { data, error, isLoading } = useSWR(url, fetcher);

  return {
    data,
    error,
    isLoading,
  };
}

export {
  useAllocatorBiggestDeal,
  useAllocatorRetrievability,
  useEditionRound,
  useStorageProviderBiggestDeal,
  useStorageProviderNumberOfDeals,
  useStorageProviderRetrievability,
};
