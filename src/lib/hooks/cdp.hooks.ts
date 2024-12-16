import {useEffect, useMemo, useState} from "react";
import {
  IAllocatorSPSComplainceResult,
  ICDPHistogram,
  ICDPHistogramResult,
  ICDPUnifiedHistogram
} from "@/lib/interfaces/cdp/cdp.interface";
import {format} from "date-fns";

type AllocatorSPSComplianceMetric = 'compliant' | 'partiallyCompliant' | 'nonCompliant';

const CDP_API = `https://cdp.allocator.tech`;

const useStorageProviderRetrievability = () => {
  const fetchData = async () => {
    const response = await fetch(`${CDP_API}/stats/acc/providers/retrievability`);
    const data = await response.json() as ICDPHistogramResult
    return {
      avgSuccessRatePct: data?.averageSuccessRate,
      count: data?.histogram?.total,
      buckets: data?.histogram?.results
    } as ICDPUnifiedHistogram;
  };

  const [data, setData] = useState<ICDPUnifiedHistogram | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    fetchData().then(setData).then(() => setIsLoading(false));
  }, []);

  return {
    data,
    isLoading
  };
};

const useStorageProviderNumberOfDeals = () => {
  const fetchData = async () => {
    const response = await fetch(`${CDP_API}/stats/acc/providers/clients`);
    const data = await response.json() as ICDPHistogram
    return {
      count: data?.total,
      buckets: data?.results
    } as ICDPUnifiedHistogram;
  };

  const [data, setData] = useState<ICDPUnifiedHistogram | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    fetchData().then(setData).then(() => setIsLoading(false));
  }, []);

  return {
    data,
    isLoading
  };
};

const useStorageProviderBiggestDeal = () => {
  const fetchData = async () => {
    const response = await fetch(`${CDP_API}/stats/acc/providers/biggest-client-distribution`);
    const data = await response.json() as ICDPHistogram
    return {
      count: data?.total,
      buckets: data?.results
    } as ICDPUnifiedHistogram;
  };

  const [data, setData] = useState<ICDPUnifiedHistogram | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    fetchData().then(setData).then(() => setIsLoading(false));
  }, []);

  return {
    data,
    isLoading
  };
};

const useAllocatorRetrievability = () => {
  const fetchData = async () => {
    const response = await fetch(`${CDP_API}/stats/acc/allocators/retrievability`);
    const data = await response.json() as ICDPHistogramResult
    return {
      avgSuccessRatePct: data?.averageSuccessRate,
      count: data?.histogram?.total,
      buckets: data?.histogram?.results
    } as ICDPUnifiedHistogram;
  };

  const [data, setData] = useState<ICDPUnifiedHistogram | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    fetchData().then(setData).then(() => setIsLoading(false));
  }, []);

  return {
    data,
    isLoading
  };
};

const useAllocatorBiggestDeal = () => {
  const fetchData = async () => {
    const response = await fetch(`${CDP_API}/stats/acc/allocators/biggest-client-distribution`);
    const data = await response.json() as ICDPHistogram
    return {
      count: data?.total,
      buckets: data?.results
    } as ICDPUnifiedHistogram;
  };

  const [data, setData] = useState<ICDPUnifiedHistogram | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    fetchData().then(setData).then(() => setIsLoading(false));
  }, []);

  return {
    data,
    isLoading
  };
};

const useAllocatorSPSComplaince = (threshold: number, usePercentage?: boolean) => {
  const fetchData = async () => {
    const response = await fetch(`${CDP_API}/stats/acc/allocators/sps-compliance-data`);
    return await response.json() as IAllocatorSPSComplainceResult
  };

  const [data, setData] = useState<IAllocatorSPSComplainceResult | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData().then(setData).then(() => setIsLoading(false));
  }, []);

  const chartData = useMemo(() => {

    if (!data || isLoading) {
      return [];
    }

    const chartData = [] as {
      name: string,
      nonCompliant: number,
      nonCompliantName: string,
      partiallyCompliant: number,
      partiallyCompliantName: string,
      compliant: number,
      compliantName: string
    }[];

    const weeks = data.results.map(item => item.week)?.sort((a, b) => (new Date(a)).getTime() - (new Date(b)).getTime());

    for (const week of weeks) {

      const total = data.results.find(item => item.week === week)?.total ?? 0;
      const modifier = (val: number) => {
        return usePercentage ? val / total * 100 : val;
      }

      const allocatorComplaincy = data.results.find(item => item.week === week)?.allocators.map(allocator => {
        const compliantSpsPercentage = allocator.compliantSpsPercentage ?? 0
        const partiallyCompliantSpsPercentage = allocator.partiallyCompliantSpsPercentage ?? 0
        if ((compliantSpsPercentage) >= threshold) {
          return 'compliant' as AllocatorSPSComplianceMetric;
        } else if ((partiallyCompliantSpsPercentage + compliantSpsPercentage) >= threshold) {
          return 'partiallyCompliant' as AllocatorSPSComplianceMetric;
        } else {
          return 'nonCompliant' as AllocatorSPSComplianceMetric;
        }
      }) ?? [];

      chartData.push({
        name: `w${format(new Date(week), 'ww yyyy')}`,
        nonCompliant: modifier(allocatorComplaincy.filter(item => item === 'nonCompliant').length),
        nonCompliantName: 'Non compliant',
        partiallyCompliant: modifier(allocatorComplaincy.filter(item => item === 'partiallyCompliant').length),
        partiallyCompliantName: 'Partially compliant',
        compliant: modifier(allocatorComplaincy.filter(item => item === 'compliant').length),
        compliantName: 'Compliant',
      });
    }


    return chartData;
  }, [data, isLoading, threshold, usePercentage]);

  return {
    chartData,
    isLoading
  }

}

export {
  useStorageProviderRetrievability,
  useStorageProviderNumberOfDeals,
  useStorageProviderBiggestDeal,
  useAllocatorRetrievability,
  useAllocatorBiggestDeal,
  useAllocatorSPSComplaince
};