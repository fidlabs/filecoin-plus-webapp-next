import {
  CDPAllocatorsSPsComplianceData,
  CDPProvidersComplianceData,
  ICDPHistogram,
  ICDPHistogramResult,
  ICDPUnifiedHistogram,
} from "@/lib/interfaces/cdp/cdp.interface";
import { getWeek } from "date-fns";
import { useCallback, useEffect, useMemo, useState } from "react";
import { groupBy, isPlainObject, mapObject } from "../utils";

type AllocatorSPSComplianceMetric =
  (typeof allocatorSPsComplianceMetrics)[number];

type ChartDataItem<T extends string> = {
  name: string;
} & {
  [K in T]: number;
} & {
  [K in T as `${T}Name`]: string;
};

const CDP_API = `https://cdp.allocator.tech`;
const allocatorSPsComplianceMetrics = [
  "compliant",
  "partiallyCompliant",
  "nonCompliant",
] as const;

const useStorageProviderRetrievability = () => {
  const fetchData = async () => {
    const response = await fetch(
      `${CDP_API}/stats/acc/providers/retrievability`
    );
    const data = (await response.json()) as ICDPHistogramResult;
    return {
      avgSuccessRatePct: data?.averageSuccessRate,
      count: data?.histogram?.total,
      buckets: data?.histogram?.results,
    } as ICDPUnifiedHistogram;
  };

  const [data, setData] = useState<ICDPUnifiedHistogram | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    fetchData()
      .then(setData)
      .then(() => setIsLoading(false));
  }, []);

  return {
    data,
    isLoading,
  };
};

const useStorageProviderNumberOfDeals = () => {
  const fetchData = async () => {
    const response = await fetch(`${CDP_API}/stats/acc/providers/clients`);
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
  }, []);

  return {
    data,
    isLoading,
  };
};

const useStorageProviderBiggestDeal = () => {
  const fetchData = async () => {
    const response = await fetch(
      `${CDP_API}/stats/acc/providers/biggest-client-distribution`
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
  }, []);

  return {
    data,
    isLoading,
  };
};

const useAllocatorRetrievability = () => {
  const fetchData = async () => {
    const response = await fetch(
      `${CDP_API}/stats/acc/allocators/retrievability`
    );
    const data = (await response.json()) as ICDPHistogramResult;
    return {
      avgSuccessRatePct: data?.averageSuccessRate,
      count: data?.histogram?.total,
      buckets: data?.histogram?.results,
    } as ICDPUnifiedHistogram;
  };

  const [data, setData] = useState<ICDPUnifiedHistogram | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    fetchData()
      .then(setData)
      .then(() => setIsLoading(false));
  }, []);

  return {
    data,
    isLoading,
  };
};

const useAllocatorBiggestDeal = () => {
  const fetchData = async () => {
    const response = await fetch(
      `${CDP_API}/stats/acc/allocators/biggest-client-distribution`
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
  }, []);

  return {
    data,
    isLoading,
  };
};

export function useAllocatorSPComplianceChartData(options: {
  mode?: "count" | "dc";
  threshold: number;
  asPercentage?: boolean;
}) {
  type CharItem = ChartDataItem<AllocatorSPSComplianceMetric>;
  type ChartData = CharItem[];
  type WeekResult = CDPAllocatorsSPsComplianceData["results"][number];
  type AllocatorData = WeekResult["allocators"][number];

  const { threshold, mode = "count", asPercentage = false } = options;
  const [data, setData] = useState<CDPAllocatorsSPsComplianceData>();
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState(false);

  const loadData = async () => {
    setError(undefined);
    setIsLoading(true);

    try {
      const response = await fetch(
        `${CDP_API}/stats/acc/allocators/sps-compliance-data`
      );

      const json = await response.json();
      assertIsAllocatorsSPsComplianceData(json);

      setData(json);
    } catch (error) {
      setError(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
        name: `W${getWeek(date)} ${date.getFullYear()}`,
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

export function useProvidersComplianceChartData(options?: {
  mode?: "count" | "dc";
  asPercentage?: boolean;
}) {
  type Item = ChartDataItem<AllocatorSPSComplianceMetric>;
  type ChartData = Item[];

  const { mode = "count", asPercentage = false } = options ?? {};
  const [data, setData] = useState<CDPProvidersComplianceData>();
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState(false);

  const loadData = async () => {
    setError(undefined);
    setIsLoading(true);

    try {
      const response = await fetch(
        `${CDP_API}/stats/acc/providers/compliance-data`
      );

      const json = await response.json();
      assertIsProvidersComplianceData(json);

      setData(json);
    } catch (error) {
      setError(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const chartData = useMemo<ChartData>(() => {
    if (!data) {
      return [];
    }

    return data.results.map((result) => {
      const date = new Date(result.week);
      const name = `W${getWeek(date)} ${date.getFullYear()}`;
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
  }, [asPercentage, data, mode]);

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

export {
  useAllocatorBiggestDeal,
  useAllocatorRetrievability,
  useStorageProviderBiggestDeal,
  useStorageProviderNumberOfDeals,
  useStorageProviderRetrievability,
};
