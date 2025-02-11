import {useEffect, useMemo, useState} from "react";
import {
  CDPProvidersComplianceData,
  IAllocatorSPSComplainceResult,
  ICDPHistogram,
  ICDPHistogramResult,
  ICDPUnifiedHistogram,
} from "@/lib/interfaces/cdp/cdp.interface";
import {endOfWeek, format, getWeek} from "date-fns";
import {isPlainObject} from "../utils";

type AllocatorSPSComplianceMetric =
  | "compliant"
  | "partiallyCompliant"
  | "nonCompliant";

type ChartDataItem<T extends string> = {
  name: string;
} & {
  [K in T]: number;
} & {
  [K in T as `${T}Name`]: string;
};

const CDP_API = `https://cdp.allocator.tech`;

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

const useAllocatorSPSComplaince = (
  threshold: number,
  usePercentage?: boolean
) => {
  const fetchData = async () => {
    const response = await fetch(
      `${CDP_API}/stats/acc/allocators/sps-compliance-data`
    );
    return (await response.json()) as IAllocatorSPSComplainceResult;
  };

  const [data, setData] = useState<IAllocatorSPSComplainceResult | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData()
      .then(setData)
      .then(() => setIsLoading(false));
  }, []);

  const chartData = useMemo(() => {
    if (!data || isLoading) {
      return [];
    }

    const chartData = [] as {
      name: string;
      nonCompliant: number;
      nonCompliantName: string;
      partiallyCompliant: number;
      partiallyCompliantName: string;
      compliant: number;
      compliantName: string;
    }[];

    const weeks = data.results
      .map((item) => item.week)
      ?.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    for (const week of weeks) {
      const total = data.results.find((item) => item.week === week)?.total ?? 0;
      const modifier = (val: number) => {
        return usePercentage ? (val / total) * 100 : val;
      };

      const allocatorComplaincy =
        data.results
          .find((item) => item.week === week)
          ?.allocators.map((allocator) => {
          const compliantSpsPercentage =
            allocator.compliantSpsPercentage ?? 0;
          const partiallyCompliantSpsPercentage =
            allocator.partiallyCompliantSpsPercentage ?? 0;
          if (compliantSpsPercentage >= threshold) {
            return "compliant" as AllocatorSPSComplianceMetric;
          } else if (
            partiallyCompliantSpsPercentage + compliantSpsPercentage >=
            threshold
          ) {
            return "partiallyCompliant" as AllocatorSPSComplianceMetric;
          } else {
            return "nonCompliant" as AllocatorSPSComplianceMetric;
          }
        }) ?? [];

      let name = `w${format(new Date(week), "ww yyyy")}`;

      if (+format(new Date(week), "ww") === 1) {
        name = `w${format(endOfWeek(new Date(week)), "ww yyyy")}`;
      }

      chartData.push({
        name,
        nonCompliant: modifier(
          allocatorComplaincy.filter((item) => item === "nonCompliant").length
        ),
        nonCompliantName: "Non compliant",
        partiallyCompliant: modifier(
          allocatorComplaincy.filter((item) => item === "partiallyCompliant")
            .length
        ),
        partiallyCompliantName: "Partially compliant",
        compliant: modifier(
          allocatorComplaincy.filter((item) => item === "compliant").length
        ),
        compliantName: "Compliant",
      });
    }

    return chartData;
  }, [data, isLoading, threshold, usePercentage]);

  return {
    chartData,
    isLoading,
  };
};

export function useProvidersComplianceChartData(options?: {
  mode: "default" | "percentage";
}) {
  type ProvidersComplianceChartData =
    ChartDataItem<AllocatorSPSComplianceMetric>[];

  const {mode = "default"} = options ?? {};
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

  const chartData = useMemo<ProvidersComplianceChartData>(() => {
    if (!data) {
      return [];
    }

    return data.results.map((result) => {
      const date = new Date(result.week);

      return {
        name: `W${getWeek(date)} ${date.getFullYear()}`,
        compliant:
          mode === "default"
            ? result.compliantSps
            : (result.compliantSps / result.totalSps) * 100,
        compliantName: "Compliant",
        partiallyCompliant:
          mode === "default"
            ? result.partiallyCompliantSps
            : (result.partiallyCompliantSps / result.totalSps) * 100,
        partiallyCompliantName: "Partially Compliant",
        nonCompliant:
          mode === "default"
            ? result.nonCompliantSps
            : (result.nonCompliantSps / result.totalSps) * 100,
        nonCompliantName: "Non Compliant",
      };
    });
  }, [data, mode]);

  return {
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
    Array.isArray(input.results) &&
    input.results.every((result) => {
      return (
        isPlainObject(result) &&
        typeof result.week === "string" &&
        typeof result.compliantSps === "number" &&
        typeof result.partiallyCompliantSps === "number" &&
        typeof result.nonCompliantSps === "number" &&
        typeof result.totalSps === "number"
      );
    });

  if (!isProvidersComplianceData) {
    throw new TypeError("Invalid response from CDP");
  }
}

export {
  useStorageProviderRetrievability,
  useStorageProviderNumberOfDeals,
  useStorageProviderBiggestDeal,
  useAllocatorRetrievability,
  useAllocatorBiggestDeal,
  useAllocatorSPSComplaince,
};
