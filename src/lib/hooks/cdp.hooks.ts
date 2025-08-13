import {
  CDPAllocatorsSPsComplianceData,
  CDPProvidersComplianceData,
  ICDPHistogram,
  ICDPHistogramResult,
  ICDPUnifiedHistogram,
} from "@/lib/interfaces/cdp/cdp.interface";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CDP_API_URL } from "../constants";
import { dateToYearWeek, groupBy, isPlainObject, mapObject } from "../utils";
import { useEditionRound } from "../providers/edition-round-provider";

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
  const { selectedRound } = useEditionRound();

  const fetchData = useCallback(async () => {
    const searchParams = new URLSearchParams();
    searchParams.set("httpRetrievability", String(httpRetrievability));
    searchParams.set("openDataOnly", String(openDataOnly));

    searchParams.set("roundId", selectedRound.id);

    const endpoint = `/stats/acc/providers/retrievability?${searchParams.toString()}`;
    const response = await fetch(`${CDP_API_URL}${endpoint}`);
    const data = (await response.json()) as ICDPHistogramResult;
    return {
      avgSuccessRatePct: data?.averageSuccessRate,
      count: data?.histogram?.total,
      buckets: data?.histogram?.results,
    } as ICDPUnifiedHistogram;
  }, [httpRetrievability, openDataOnly, selectedRound.id]);

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
  const { selectedRound } = useEditionRound();

  const fetchData = async () => {
    const searchParams = new URLSearchParams();
    searchParams.set("roundId", selectedRound.id);

    const response = await fetch(
      `${CDP_API_URL}/stats/acc/providers/clients?${searchParams.toString()}`
    );
    const data = (await response.json()) as ICDPHistogram;
    return {
      count: data?.total,
      buckets: data?.results,
    } as ICDPUnifiedHistogram;
  };

  const [data, setData] = useState<ICDPUnifiedHistogram | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    fetchData()
      .then(setData)
      .then(() => setIsLoading(false));
  }, [selectedRound.id]);

  return {
    data,
    isLoading,
  };
};

const useStorageProviderBiggestDeal = () => {
  const { selectedRound } = useEditionRound();

  const fetchData = async () => {
    const searchParams = new URLSearchParams();
    searchParams.set("roundId", selectedRound.id);

    const response = await fetch(
      `${CDP_API_URL}/stats/acc/providers/biggest-client-distribution?${searchParams.toString()}`
    );
    const data = (await response.json()) as ICDPHistogram;
    return {
      count: data?.total,
      buckets: data?.results,
    } as ICDPUnifiedHistogram;
  };

  const [data, setData] = useState<ICDPUnifiedHistogram | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    fetchData()
      .then(setData)
      .then(() => setIsLoading(false));
  }, [selectedRound.id]);

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
  const { selectedRound } = useEditionRound();

  const fetchData = useCallback(async () => {
    const searchParams = new URLSearchParams();
    searchParams.set("httpRetrievability", String(httpRetrievability));
    searchParams.set("openDataOnly", String(openDataOnly));
    searchParams.set("roundId", selectedRound.id);

    const endpoint = `/stats/acc/allocators/retrievability?${searchParams.toString()}`;
    const response = await fetch(`${CDP_API_URL}${endpoint}`);
    const data = (await response.json()) as ICDPHistogramResult;

    return {
      avgSuccessRatePct: data?.averageSuccessRate,
      count: data?.histogram?.total,
      buckets: data?.histogram?.results,
    } as ICDPUnifiedHistogram;
  }, [httpRetrievability, openDataOnly, selectedRound.id]);

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
  const { selectedRound } = useEditionRound();

  const fetchData = async () => {
    const searchParams = new URLSearchParams();
    searchParams.set("roundId", selectedRound.id);

    const response = await fetch(
      `${CDP_API_URL}/stats/acc/allocators/biggest-client-distribution?${searchParams.toString()}`
    );
    const data = (await response.json()) as ICDPHistogram;
    return {
      count: data?.total,
      buckets: data?.results,
    } as ICDPUnifiedHistogram;
  };

  const [data, setData] = useState<ICDPUnifiedHistogram | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    fetchData()
      .then(setData)
      .then(() => setIsLoading(false));
  }, [selectedRound.id]);

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

  const { selectedRound } = useEditionRound();

  const [data, setData] = useState<ICDPUnifiedHistogram | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = useCallback(async () => {
    const searchParams = new URLSearchParams();
    searchParams.set("roundId", selectedRound.id);

    const response = await fetch(
      `${CDP_API_URL}/stats/acc/${apiMode}/clients?${searchParams.toString()}`
    );
    const data = (await response.json()) as ICDPHistogram;
    return {
      count: data?.total,
      buckets: data?.results,
    } as ICDPUnifiedHistogram;
  }, [apiMode, selectedRound.id]);

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

  const { selectedRound } = useEditionRound();

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

    fetchOptions.append("roundId", selectedRound.id);

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
    selectedRound.id,
  ]);

  useEffect(() => {
    loadData();
  }, [loadData, selectedRound.id]);

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
    (allocatorsData: AllocatorData[], total: number) => {
      const value =
        mode === "count"
          ? allocatorsData.length
          : allocatorsData.reduce(
              (sumOfDatacap, allocator) =>
                sumOfDatacap + allocator.totalDatacap,
              0
            );
      return asPercentage ? (value / total) * 100 : value;
    },
    [asPercentage, mode, selectedRound.id]
  );

  const chartData = useMemo<ChartData>(() => {
    if (!data) {
      return [];
    }

    return data.results.map((result) => {
      const date = new Date(result.week);
      const total =
        mode === "count"
          ? result.allocators.length
          : result.allocators.reduce(
              (sumOfDatacap, allocator) =>
                sumOfDatacap + allocator.totalDatacap,
              0
            );
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
  const { selectedRound } = useEditionRound();

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

    fetchOptions.append("roundId", selectedRound.id);

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
    selectedRound.id,
  ]);

  useEffect(() => {
    loadData();
  }, [loadData, selectedRound.id]);

  const chartData = useMemo<ChartData>(() => {
    if (!data) {
      return [];
    }

    return data.results.map((result) => {
      const name = dateToYearWeek(result.week);
      const totalDatacap =
        result.compliantSpsTotalDatacap +
        result.partiallyCompliantSpsTotalDatacap +
        result.nonCompliantSpsTotalDatacap;
      const divider = mode === "count" ? result.totalSps : totalDatacap;
      const values: [number, number, number] =
        mode === "count"
          ? [
              result.compliantSps,
              result.partiallyCompliantSps,
              result.nonCompliantSps,
            ]
          : [
              result.compliantSpsTotalDatacap,
              result.partiallyCompliantSpsTotalDatacap,
              result.nonCompliantSpsTotalDatacap,
            ];
      const [compliant, partiallyCompliant, nonCompliant] = asPercentage
        ? values.map((value) => (value / divider) * 100)
        : values;

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
  }, [asPercentage, data, mode, selectedRound.id]);

  return {
    averageSuccessRate: data?.averageSuccessRate,
    chartData,
    error,
    isLoading,
  };
}

function assertIsProvidersComplianceData(
  input: unknown
): asserts input is CDPProvidersComplianceData {
  const isProvidersComplianceData =
    isPlainObject(input) &&
    typeof input.averageSuccessRate === "number" &&
    Array.isArray(input.results) &&
    input.results.every((result) => {
      return (
        isPlainObject(result) &&
        typeof result.week === "string" &&
        typeof result.averageSuccessRate === "number" &&
        typeof result.compliantSps === "number" &&
        typeof result.partiallyCompliantSps === "number" &&
        typeof result.nonCompliantSps === "number" &&
        typeof result.totalSps === "number" &&
        typeof result.compliantSpsTotalDatacap === "number" &&
        typeof result.partiallyCompliantSpsTotalDatacap === "number" &&
        typeof result.nonCompliantSpsTotalDatacap === "number"
      );
    });

  if (!isProvidersComplianceData) {
    throw new TypeError("Invalid response from CDP");
  }
}

function assertIsAllocatorsSPsComplianceData(
  input: unknown
): asserts input is CDPAllocatorsSPsComplianceData {
  const isAllocatorsSPsComplianceData =
    isPlainObject(input) &&
    typeof input.averageSuccessRate === "number" &&
    Array.isArray(input.results) &&
    input.results.every((result) => {
      return (
        isPlainObject(result) &&
        typeof result.week === "string" &&
        typeof result.averageSuccessRate === "number" &&
        Array.isArray(result.allocators) &&
        result.allocators.every((allocator) => {
          return (
            typeof allocator.compliantSpsPercentage === "number" &&
            typeof allocator.partiallyCompliantSpsPercentage === "number" &&
            typeof allocator.nonCompliantSpsPercentage === "number" &&
            typeof allocator.totalSps === "number" &&
            typeof allocator.totalDatacap === "number"
          );
        })
      );
    });

  if (!isAllocatorsSPsComplianceData) {
    throw new TypeError(
      "Invalid response from CDP when fetching allocators SPs compliance data"
    );
  }
}

export {
  useAllocatorBiggestDeal,
  useAllocatorRetrievability,
  useEditionRound,
  useStorageProviderBiggestDeal,
  useStorageProviderNumberOfDeals,
  useStorageProviderRetrievability,
};
