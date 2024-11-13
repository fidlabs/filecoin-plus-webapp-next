import {useEffect, useState} from "react";
import {ICDPHistogram, ICDPHistogramResult, ICDPUnifiedHistogram} from "@/lib/interfaces/cdp/cdp.interface";

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

export {useStorageProviderRetrievability, useStorageProviderNumberOfDeals, useStorageProviderBiggestDeal};