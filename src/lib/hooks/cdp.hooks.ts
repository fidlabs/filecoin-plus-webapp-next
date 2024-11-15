import {useEffect, useMemo, useState} from "react";
import {
  IAllocatorSPSComplainceResult,
  ICDPHistogram,
  ICDPHistogramResult,
  ICDPUnifiedHistogram
} from "@/lib/interfaces/cdp/cdp.interface";
import {difference} from "lodash";
import {format} from "date-fns";

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

const useAllocatorSPSComplaince = (threshold: number) => {
  const fetchData = async () => {
    const response = await fetch(`${CDP_API}/stats/acc/allocators/sps-compliance`);
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

    const nonCompliantMetric = data?.results[0]?.histogram?.results;
    const compliantMetric = data?.results[2]?.histogram?.results;
    const partiallyCompliantMetric = data?.results[1]?.histogram?.results;
    const weeks = nonCompliantMetric.map(item => item.week)?.sort((a, b) => (new Date(a)).getTime() - (new Date(b)).getTime());

    const differedWeeks = difference(weeks, compliantMetric.map(item => item.week), partiallyCompliantMetric.map(item => item.week));

    if (differedWeeks.length) {
      console.error('/stats/acc/allocators/sps-compliance - Weeks are not equal');
      return []
    }

    for (const week of weeks) {
      const nonCompliant = nonCompliantMetric.find(item => item.week === week);
      const nonCompliantCount = nonCompliant?.total || 0;
      const partiallyCompliant = partiallyCompliantMetric.find(item => item.week === week);
      const partiallyCompliantCount = partiallyCompliant?.results?.filter(item => item.valueFromExclusive >= threshold)?.reduce((acc, item) => acc + item.count, 0) || 0;
      const compliant = compliantMetric.find(item => item.week === week);
      const compliantCount = compliant?.results?.filter(item => item.valueFromExclusive >= threshold)?.reduce((acc, item) => acc + item.count, 0) || 0;

      chartData.push({
        name: `w${format(new Date(week), 'ww yyyy')}`,
        nonCompliant: nonCompliantCount - partiallyCompliantCount - compliantCount,
        nonCompliantName: 'Non compliant',
        partiallyCompliant: partiallyCompliantCount,
        partiallyCompliantName: 'Partially compliant',
        compliant: compliantCount,
        compliantName: 'Compliant',
      });
    }


    return chartData;
  }, [data, isLoading, threshold]);

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