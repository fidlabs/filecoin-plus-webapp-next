import {useCallback, useMemo} from "react";
import {useGoogleSheetFilters, useGoogleSheetsAuditReport} from "@/lib/hooks/google.hooks";
import {IAllocatorsWithSheetInfo, IAllocatorWithSheetInfo} from "@/lib/interfaces/cdp/google.interface";


export interface DataCapChild {
  name: string;
  nodeId: number;
  attributes: {
    datacap?: number;
    allocators?: number;
    allocatorsIdList?: string;
    allocatorId?: string;
    id?: string;
  };
  children: DataCapChild[] | undefined;
}

const useDataCapFlow = () => {

  const {
    activeFilter, partialFilter, failedFilter, notActiveFilter, notAuditedFilter, notWaitingFilter, passFilter
  } = useGoogleSheetFilters()

  const { results, loading, loaded } = useGoogleSheetsAuditReport();

  const getElement = useCallback((nodeIdGenerator: Generator<number>, name: string, array: IAllocatorWithSheetInfo[], withSimpleChildren = false) => {

    const element = {
      name,
      nodeId: nodeIdGenerator.next().value as number,
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
      allocators: array.length,
      allocatorsIdList: array.map((data) => data.addressId).join(','),
    };
  };

  const getAudits = useCallback((nodeIdGenerator: Generator<number>, results: IAllocatorsWithSheetInfo) => {
    const numberOfAudits = results.audits;
    const data = results.data.filter(activeFilter);
    const audits = [
      {
        ...getElement(nodeIdGenerator, 'Not Audited', data.filter(notAuditedFilter), true)
      }
    ];

    for (let i = 0; i < numberOfAudits; i++) {
      const notWaitingData = data.filter(notWaitingFilter(i));

      audits.push({
        ...getElement(nodeIdGenerator, `Audit ${i + 1}`, notWaitingData),
        children: !!notWaitingData.length ? [
          getElement(nodeIdGenerator, 'Failed', notWaitingData.filter(failedFilter(i)), true),
          getElement(nodeIdGenerator, 'Conditional', notWaitingData.filter(partialFilter(i)), true),
          getElement(nodeIdGenerator, 'Pass', notWaitingData.filter(passFilter(i)), true)
        ] : undefined
      });
    }

    return audits;
  }, [activeFilter, failedFilter, getElement, notAuditedFilter, notWaitingFilter, partialFilter, passFilter]);

  function* getNodeIdGenerator() {
    let id = 0;
    while (true) {
      yield id++;
    }
  }

  const dataCapFlow = useMemo(() => {

    if (!loaded) {
      return [];
    }

    const nodeIdGenerator = getNodeIdGenerator();

    return [{
      name: 'Root Key Holder',
      nodeId: nodeIdGenerator.next().value as number,
      attributes: getAttributes(results.data),
      children: [
        getElement(nodeIdGenerator, 'Not Active', results.data.filter(notActiveFilter), true),
        {
          ...getElement(nodeIdGenerator, 'Active', results.data.filter(activeFilter)),
          children: getAudits(nodeIdGenerator, results)
        }
      ]
    }];
  }, [loaded, results, getElement, notActiveFilter, activeFilter, getAudits]);

  return {
    rawData: results,
    dataCapFlow,
    loading,
    loaded
  };
}

export {
  useDataCapFlow,
};

