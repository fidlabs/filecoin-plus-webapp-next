"use client";

import {createContext, PropsWithChildren, useCallback, useContext, useEffect, useState} from 'react';
import {ICDPRange} from "@/lib/interfaces/cdp/cdp.interface";
import {usePathname, useRouter, useSearchParams} from "next/navigation";

const barTabs = ['3 groups', '6 groups', 'All'];
const scaleTabs = ['Linear scale', 'Log scale'];

const allowedElements = [
  'RetrievabilityScoreSP',
  'NumberOfDealsSP',
  'BiggestDealsSP',
  'RetrievabilityScoreAllocator',
  'BiggestDealsAllocator',
  'ProviderComplianceAllocator',
  'AuditStateAllocator',
  'AuditOutcomesAllocator',
]

const CommonChartContext = createContext({
  barTabs,
  scaleTabs,
  globalBarTab: '6 groups',
  setGlobalBarTab: (v: string) => console.log(v),
  globalScaleTab: '',
  setGlobalScaleTab: (v: string) => console.log(v),
  currentElement: 'RetrievabilityScoreSP',
  scrollTo: (element: string) => console.log(element),
  groupData: (data: ICDPRange[], groupCount: number) => {
    console.log(data, groupCount)
    return [] as ICDPRange[][];
  },
  parseSingleBucketWeek: (bucket: ICDPRange, index: number, length: number, unit: string) => {
    console.log(bucket, index, length, unit)
    return {
      name: '',
      value: 0
    }
  },
  parseBucketGroupWeek: (group: ICDPRange[], index: number, length: number, unit: string) => {
    console.log(group, index, length, unit)
    return {
      name: '',
      value: 0
    }
  },
});

const CdpProvider = ({children}: PropsWithChildren) => {

  const searchParams = useSearchParams();
  const router = useRouter()
  const pathName = usePathname()

  const [globalBarTab, setGlobalBarTab] = useState('6 groups');
  const [globalScaleTab, setGlobalScaleTab] = useState('linear');
  const [currentElement, setCurrentElement] = useState('RetrievabilityScoreSP');

  useEffect(() => {
    const element = searchParams.get('chart');
    if (element && allowedElements.includes(element)) {
      setCurrentElement(element);
    }
  }, [searchParams])

  const scrollTo = useCallback((element: string) => {
    const newPath = `${pathName}?chart=${element}`
    router.replace(newPath);
  }, [pathName, router]);

  const groupData = useCallback((data: ICDPRange[], groupCount: number) => {

    if (!data || !data.length || !groupCount) {
      return [];
    }

    const groupedData = [];
    const size = Math.ceil(data.length / groupCount);

    for (let i = 0; i < data.length; i += size) {
      groupedData.push(data.slice(i, i + size));
    }
    return groupedData;
  }, []);

  const parseSingleBucketWeek = useCallback((bucket: ICDPRange, index: number, length: number, unit = '') => {
    let name = `${bucket.valueFromExclusive + 1} - ${bucket.valueToInclusive}${unit}`;
    if (bucket.valueToInclusive - bucket.valueFromExclusive <= 1) {
      const unitWithoutS = unit.slice(0, -1);
      name = `${bucket.valueToInclusive}${bucket.valueToInclusive === 1 ? unitWithoutS : unit}`;
    } else if (index === 0) {
      const unitWithoutS = unit.slice(0, -1);
      name = `${bucket.valueFromExclusive < 0 ? '' : 'Less than '}${bucket.valueToInclusive}${bucket.valueToInclusive === 1 ? unitWithoutS : unit}`;
    } else if (index === length - 1) {
      name = `Over ${bucket.valueFromExclusive}${unit}`;
    }
    return {
      name,
      value: bucket.count
    };
  }, []);

  const parseBucketGroupWeek = useCallback((group: ICDPRange[], index: number, length: number, unit = '') => {
    let name = `${group[0].valueFromExclusive + 1} - ${group[group.length - 1].valueToInclusive}${unit}`;
    if (index === 0) {
      name = `Less than ${group[group.length - 1].valueToInclusive}${unit}`;
    } else if (index === length - 1) {
      name = `Over ${group[0].valueFromExclusive}${unit}`;
    }
    return {
      name,
      value: group.reduce((acc, bucket) => acc + bucket.count, 0)
    };
  }, []);

  return (
    <CommonChartContext.Provider value={{
      barTabs,
      scaleTabs,
      globalBarTab,
      globalScaleTab,
      setGlobalBarTab,
      setGlobalScaleTab,
      currentElement,
      scrollTo,
      groupData,
      parseSingleBucketWeek,
      parseBucketGroupWeek,
    }}>
      {children}
    </CommonChartContext.Provider>
  );
};

const useCDPUtils = () => {
  return useContext(CommonChartContext);
}

export {CdpProvider, useCDPUtils};
