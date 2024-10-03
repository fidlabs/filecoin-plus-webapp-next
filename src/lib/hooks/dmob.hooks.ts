import {useCallback, useEffect, useState} from "react";
import {
  IFilDCAllocationsWeekly,
  IFilDCAllocationsWeeklyByClient,
  IFilDCFLow,
  IFilDCFLowActiveAllocators,
  IFilDCFLowAllocator,
  IFilDCFLowAllocators,
  IFilPlusStats
} from "@/lib/interfaces/dmob/dmob.interface";
import {groupBy, isEqual} from "lodash";
import {convertBytesToIEC} from "@/lib/utils";
import {
  getAllocators,
  getClients,
  getDataCapAllocationsWeekly,
  getDataCapAllocationsWeeklyByClient,
  getDCFlow,
  getStats,
  getStorageProviders
} from "@/lib/api";
import {IApiQuery} from "@/lib/interfaces/api.interface";
import {IStorageProvidersResponse} from "@/lib/interfaces/dmob/sp.interface";
import {IClientsResponse} from "@/lib/interfaces/dmob/client.interface";
import {IAllocatorsResponse} from "@/lib/interfaces/dmob/allocator.interface";


export interface DataCapChild {
  name: string;
  attributes: {
    datacap?: number;
    allocators?: number;
    id?: string;
  };
  children: DataCapChild[] | undefined;
}

const PB_10 = 10 * 1024 * 1024 * 1024 * 1024 * 1024;
const PB_15 = 15 * 1024 * 1024 * 1024 * 1024 * 1024;

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

  const [data, setData] = useState<DataCapChild[] | undefined>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const getName = useCallback((key: string) => {
    switch (key) {
      case 'rkh':
        return 'Root Key Holder';
      case 'inactiveAllocators':
        return 'Inactive Allocators';
      case 'activeAllocators':
        return 'Active Allocators';
      case 'passedAudit':
        return 'Passed Audit';
      case 'passedAuditConditionally':
        return 'Passed Audit Conditionally';
      case 'failedAudit':
        return 'Failed Audit';
      case 'notAudited':
        return 'Not Audited';
      default:
        return key;
    }
  }, [])

  const countChildAllocators = useCallback((data: IFilDCFLowAllocator | IFilDCFLowAllocators): number | undefined => {
    if ((data as IFilDCFLowAllocator)?.datacap) {
      return undefined;
    }

    if ((data as IFilDCFLowAllocators)?.allocators?.length) {
      return (data as IFilDCFLowAllocators).allocators.length;
    } else {
      return Object.entries(data).reduce((acc, [, data]) => {
        return acc + (countChildAllocators(data) ?? 0);
      }, 0);
    }
  }, [])

  const groupAllocators = useCallback((allocators: IFilDCFLowAllocator[], skipUnique = false): DataCapChild[] => {

    const uniqueAllocationValues = Array.from(new Set(allocators.map(a => a.datacap)));

    if (uniqueAllocationValues.length > 3 && !skipUnique) {
      const datacapAllocatorsGrouped = groupBy(Object.values(allocators), item => {
        if (+item.datacap < PB_10) {
          return '<10 PiB';
        } else if (+item.datacap < PB_15) {
          return '>10 PiB & <15 PiB';
        } else {
          return '>15 PiB';
        }
      });
      return Object.entries(datacapAllocatorsGrouped).map(([key, data]) => {
        return {
          name: key,
          attributes: {
            datacap: data.reduce((acc, curr) => acc + +curr.datacap, 0),
            allocators: data.length
          },
          children: groupAllocators(data, true)
        } as DataCapChild;
      });
    } else {
      const datacapAllocatorsGrouped = groupBy(Object.values(allocators), item => convertBytesToIEC(+item.datacap));

      if (Object.keys(datacapAllocatorsGrouped).length === 1) {
        return Object.values(datacapAllocatorsGrouped)[0].map((data) => {
          return {
            name: data.name ?? data.addressId,
            attributes: {
              datacap: +data.datacap,
              id: data.addressId
            },
            children: undefined
          } as DataCapChild;
        });
      }

      return Object.entries(datacapAllocatorsGrouped).map(([key, data]) => {
        if (data.length === 1) {
          return {
            name: data[0].name ?? data[0].addressId,
            attributes: {
              datacap: +data[0].datacap,
              id: data[0].addressId
            },
            children: undefined
          };
        }
        return {
          name: key,
          attributes: {
            datacap: data.reduce((acc, curr) => acc + +curr.datacap, 0),
            allocators: data.length
          },
          children: data.map((data) => {
            return {
              name: data.name ?? data.addressId,
              attributes: {
                datacap: +data.datacap,
                id: data.addressId
              },
              children: undefined
            };
          })
        };
      });
    }
  }, [])

  const parseChildren = useCallback((data: IFilDCFLowAllocators): DataCapChild[] => {

    if (data?.allocators?.length > 10) {
      return groupAllocators(data.allocators);
    }

    return data?.allocators?.map((data) => ({
      name: data.name ?? data.addressId,
      attributes: {
        datacap: +data.datacap,
        id: data.addressId
      },
      children: undefined
    } as DataCapChild));

  }, [groupAllocators]);

  const parseChildrenGroups = useCallback((data: IFilDCFLowActiveAllocators): DataCapChild[] => {
    return Object.entries(data).map(([key, data]) => ({
      name: getName(key),
      attributes: {
        datacap: data.totalDc ? +data.totalDc : Object.values(data).reduce((acc, val) => (acc as number) + +(val as IFilDCFLowAllocators).totalDc, 0),
        allocators: countChildAllocators(data)
      },
      children: data?.allocators?.length ? parseChildren(data) : parseChildrenGroups(data)
    } as DataCapChild));

  }, [countChildAllocators, getName, parseChildren]);

  const parseDCFLow = useCallback((data: IFilDCFLow): DataCapChild[] => {
    return Object.entries(data).map(([key, data]) => {
      const children = data?.allocators?.length ? parseChildren(data) : parseChildrenGroups(data);
      return {
        name: getName(key),
        children,
        attributes: {
          datacap: children.reduce((acc, curr) => acc + +(curr.attributes.datacap ?? 0), 0),
          allocators: children.reduce((acc, curr) => acc + +(curr.attributes.datacap ?? 0), 0)
        }
      };
    });
  }, [getName, parseChildren, parseChildrenGroups]);

  useEffect(() => {
    setLoading(true);
    getDCFlow().then(data => {
      setData(parseDCFLow(data));
      setLoading(false);
    });
  }, [parseDCFLow]);

  return {
    data,
    loading
  }
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

