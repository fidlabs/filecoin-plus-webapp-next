import {useCallback, useEffect, useMemo, useState} from "react";
import {
  IFilDCAllocationsWeekly,
  IFilDCAllocationsWeeklyByClient,
  IFilPlusStats
} from "@/lib/interfaces/dmob/dmob.interface";
import {isEqual} from "lodash";
import {
  getAllocators,
  getClients,
  getDataCapAllocationsWeekly,
  getDataCapAllocationsWeeklyByClient,
  getStats,
  getStorageProviders
} from "@/lib/api";
import {IApiQuery} from "@/lib/interfaces/api.interface";
import {IStorageProvidersResponse} from "@/lib/interfaces/dmob/sp.interface";
import {IClientsResponse} from "@/lib/interfaces/dmob/client.interface";
import {IAllocatorsResponse} from "@/lib/interfaces/dmob/allocator.interface";
import {useGoogleSheetFilters, useGoogleSheetsAuditReport} from "@/lib/hooks/google.hooks";
import {IAllocatorsWithSheetInfo, IAllocatorWithSheetInfo} from "@/lib/interfaces/cdp/google.interface";


export interface DataCapChild {
  name: string;
  attributes: {
    datacap?: number;
    allocators?: number;
    allocatorId?: string;
    id?: string;
  };
  children: DataCapChild[] | undefined;
}

const getDifferentParams = (params: IApiQuery, newParams: IApiQuery): string[] => {
  return Object.keys(newParams).filter(key => newParams[key] !== params[key]);
}

const shouldClearData = (params: IApiQuery | undefined, newParams: IApiQuery | undefined): boolean => {
  if (!params || !newParams) {
    return true;
  }
  const differentParams = getDifferentParams(params!, newParams!);
  return differentParams.some(key => key !== 'page');
}

const useDataCapFlow = () => {

  const {
    activeFilter, partialFilter, failedFilter, notActiveFilter, notAuditedFilter, notWaitingFilter, passFilter
  } = useGoogleSheetFilters()

  const { results, loading, loaded } = useGoogleSheetsAuditReport();

  const getElement = useCallback((name: string, array: IAllocatorWithSheetInfo[], withSimpleChildren = false) => {

    const element = {
      name,
      attributes: getAttributes(array)
    } as DataCapChild;

    if (withSimpleChildren) {
      element['children'] = array.map((data) => ({
        name: data.name,
        attributes: {
          datacap: +data.initialAllowance,
          allocatorId: data.addressId
        },
        children: undefined
      } as DataCapChild));
    }
    return element;
  }, []);

  const getAttributes = (array: IAllocatorWithSheetInfo[]) => {
    return {
      datacap: array.reduce((acc, curr) => acc + +curr.initialAllowance, 0),
      allocators: array.length
    };
  };

  const getAudits = useCallback((results: IAllocatorsWithSheetInfo) => {
    const numberOfAudits = results.audits;
    const data = results.data.filter(activeFilter);
    const audits = [
      {
        ...getElement('Not Audited', data.filter(notAuditedFilter), true)
      }
    ];

    for (let i = 0; i < numberOfAudits; i++) {
      const notWaitingData = data.filter(notWaitingFilter(i));

      audits.push({
        ...getElement(`Audit ${i + 1}`, notWaitingData),
        children: !!notWaitingData.length ? [
          getElement('Failed', notWaitingData.filter(failedFilter(i)), true),
          getElement('Conditional', notWaitingData.filter(partialFilter(i)), true),
          getElement('Pass', notWaitingData.filter(passFilter(i)), true)
        ] : undefined
      });
    }

    return audits;
  }, [activeFilter, failedFilter, getElement, notAuditedFilter, notWaitingFilter, partialFilter, passFilter]);

  const dataCapFlow = useMemo(() => {

    if (!loaded) {
      return [];
    }

    return [{
      name: 'Root Key Holder',
      attributes: getAttributes(results.data),
      children: [
        getElement('Not Active', results.data.filter(notActiveFilter), true),
        {
          ...getElement('Active', results.data.filter(activeFilter)),
          children: getAudits(results)
        }
      ]
    }];
  }, [loaded, results, getElement, notActiveFilter, activeFilter, getAudits]);

  return {
    dataCapFlow,
    loading,
    loaded
  };
}

const useStats = () => {
  const [data, setData] = useState<IFilPlusStats | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    getStats().then(data => {
      setData(data);
      setLoading(false);
    });
  }, []);

  return {
    data,
    loading
  }
}

const useDataCapAllocationsWeekly = () => {
  const [data, setData] = useState<IFilDCAllocationsWeekly | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    getDataCapAllocationsWeekly().then(data => {
      setData(data);
      setLoading(false);
    });
  }, []);

  return {
    data,
    loading
  }
}

const useDataCapAllocationsWeeklyByClient = () => {
  const [data, setData] = useState<IFilDCAllocationsWeeklyByClient | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    getDataCapAllocationsWeeklyByClient().then(data => {
      setData(data);
      setLoading(false);
    });
  }, []);

  return {
    data,
    loading
  }
}

const useAllocators = (params?: IApiQuery) => {
  const [data, setData] = useState<IAllocatorsResponse | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentParams, setCurrentParams] = useState<IApiQuery | undefined>(params);

  useEffect(() => {
    if (isEqual(currentParams, params)) {
      return;
    }
    if (shouldClearData(currentParams, params)) {
      setLoading(true);
      setData(undefined)
    }
    setCurrentParams(params);

    getAllocators(params)
      .then(setData)
      .finally(() => {
        setLoading(false);
      });
  }, [currentParams, params]);

  return {
    data,
    loading
  }
}

const useAllAllocators = () => {
  const [data, setData] = useState<IAllocatorsResponse | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    setData(undefined)
    getAllocators({
      page: '1',
      showInactive: 'true',
    })
      .then(setData)
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return {
    data,
    loading
  }
}

const useClients = (params?: IApiQuery) => {
  const [data, setData] = useState<IClientsResponse | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentParams, setCurrentParams] = useState<IApiQuery | undefined>(params);

  useEffect(() => {
    if (isEqual(currentParams, params)) {
      return;
    }
    if (shouldClearData(currentParams, params)) {
      setLoading(true);
      setData(undefined)
    }
    setCurrentParams(params);

    getClients(params)
      .then(setData)
      .finally(() => {
        setLoading(false);
      });
  }, [currentParams, params]);

  return {
    data,
    loading
  }
}

const useStorageProviders = (params?: IApiQuery) => {
  const [data, setData] = useState<IStorageProvidersResponse | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentParams, setCurrentParams] = useState<IApiQuery | undefined>(params);

  useEffect(() => {
    if (isEqual(currentParams, params)) {
      return;
    }
    if (shouldClearData(currentParams, params)) {
      setLoading(true);
      setData(undefined)
    }
    setCurrentParams(params);

    getStorageProviders(params)
      .then(setData)
      .finally(() => {
        setLoading(false);
      });
  }, [currentParams, params]);

  return {
    data,
    loading
  }
}

export {
  useDataCapFlow,
  useStats,
  useDataCapAllocationsWeekly,
  useDataCapAllocationsWeeklyByClient,
  useAllocators,
  useAllAllocators,
  useClients,
  useStorageProviders,
};

