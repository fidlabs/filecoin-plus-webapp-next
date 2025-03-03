import {useCallback, useEffect, useMemo, useState} from "react";
import {
  getAllocators,
  getGoogleSheetAllocatorsTrust,
  getGoogleSheetAuditHistory,
  getGoogleSheetAuditHistorySizes, getGoogleSheetAuditTimeline
} from "@/lib/api";
import {IAllocatorsResponse} from "@/lib/interfaces/dmob/allocator.interface";
import {
  IAllocatorsWithSheetInfo,
  IAllocatorWithSheetInfo,
  IGoogleSheetResponse
} from "@/lib/interfaces/cdp/google.interface";
import {groupBy} from "lodash";

const PIB = 1024 * 1024 * 1024 * 1024 * 1024;

const useGoogleSheetFilters = () => {

  const [FAILED_STATUSES] = useState(['REJECT']);
  const [PARTIAL_STATUSES] = useState(['THROTTLE']);
  const [PASS_STATUSES] = useState(['MATCH', 'DOUBLE', 'QUADRUPLE']);
  const [WAITING_STATUSES] = useState(['WAITING', 'PRE AUDIT']);

  const activeFilter = useCallback((data: IAllocatorWithSheetInfo) => data.isActive, [])
  const notActiveFilter = useCallback((data: IAllocatorWithSheetInfo) => !data.isActive, [])

  const notAuditedFilter = useCallback((data: IAllocatorWithSheetInfo) => activeFilter(data) && data.isAudited === false, [activeFilter])
  const auditedFilter = useCallback((data: IAllocatorWithSheetInfo) => activeFilter(data) && data.isAudited === true, [activeFilter])

  const notWaitingFilter = useCallback((i: number) => (data: IAllocatorWithSheetInfo) => auditedFilter(data) && !!data.auditStatuses[i] && data.lastValidAudit === i && data.auditStatuses[i] !== 'WAITING', [auditedFilter])

  const failedFilter = useCallback((i: number) => (data: IAllocatorWithSheetInfo) => notWaitingFilter(i)(data) && !!data.auditStatuses[i] && FAILED_STATUSES.includes(data.auditStatuses[i]), [FAILED_STATUSES, notWaitingFilter])
  const partialFilter = useCallback((i: number) => (data: IAllocatorWithSheetInfo) => notWaitingFilter(i)(data) && !!data.auditStatuses[i] && PARTIAL_STATUSES.includes(data.auditStatuses[i]), [PARTIAL_STATUSES, notWaitingFilter])
  const passFilter = useCallback((i: number) => (data: IAllocatorWithSheetInfo) => notWaitingFilter(i)(data) && !!data.auditStatuses[i] && PASS_STATUSES.includes(data.auditStatuses[i]), [PASS_STATUSES, notWaitingFilter])

  return {
    activeFilter,
    notActiveFilter,
    notAuditedFilter,
    auditedFilter,
    notWaitingFilter,
    failedFilter,
    partialFilter,
    passFilter,
    FAILED_STATUSES,
    PARTIAL_STATUSES,
    PASS_STATUSES,
    WAITING_STATUSES
  }
}

const useGoogleSheetsAuditReport = () => {

  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<IAllocatorsResponse | undefined>(undefined)
  const [googleSheetsAuditHistory, setGoogleSheetsAuditHistory] = useState<IGoogleSheetResponse | undefined>(undefined)
  const [googleSheetsAuditSizes, setGoogleSheetsAuditSizes] = useState<IGoogleSheetResponse | undefined>(undefined)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      getAllocators({showInactive: 'false'}),
      getGoogleSheetAuditHistory(),
      getGoogleSheetAuditHistorySizes()
    ]).then(([allocators, auditHistory, auditSizes]) => {
      setData(allocators);
      setGoogleSheetsAuditHistory(auditHistory)
      setGoogleSheetsAuditSizes(auditSizes)
      setLoading(false);
    });
  }, []);


  const parsedData = useMemo(() => {
    if (!data || !googleSheetsAuditHistory || !googleSheetsAuditSizes) {
      return {
        audits: 0,
        data: []
      } as IAllocatorsWithSheetInfo;
    }
    setLoaded(false);
    const returnData = {
      audits: 0,
      data: []
    } as IAllocatorsWithSheetInfo;

    if (data?.data && googleSheetsAuditHistory?.values && googleSheetsAuditSizes?.values) {
      const allocatorIdIndex = googleSheetsAuditHistory.values[0].indexOf('Allocator ID');
      const allocatorIdName = googleSheetsAuditHistory.values[0].indexOf('Allocator');
      const firstReviewIndex = googleSheetsAuditHistory.values[0].indexOf('1');
      const firstReviewIndexSizes = googleSheetsAuditSizes.values[0].indexOf('1');

      returnData.audits = +(googleSheetsAuditHistory.values[0][googleSheetsAuditHistory.values[0].length - 1]);

      if (allocatorIdIndex === -1) {
        throw new Error('Allocator ID column not found in google sheets data');
      }


      data?.data.forEach((result) => {
        const googleAuditHistoryData = googleSheetsAuditHistory?.values.find((data) => data[allocatorIdIndex] === result.addressId);
        const googleAuditSizesData = googleSheetsAuditSizes?.values.find((data) => data[allocatorIdIndex] === result.addressId);
        const auditStatuses = googleAuditHistoryData ? googleAuditHistoryData.slice(firstReviewIndex).map(item => item.toUpperCase()) : []
        const auditSizes = googleAuditSizesData ? googleAuditSizesData.slice(firstReviewIndexSizes).map(item => {
          const numeric = +item;
          return isNaN(numeric) || !numeric ? 5 : numeric;
        }) : []

        const name = googleAuditHistoryData?.[allocatorIdName] ?? result.orgName;

        if (!!name) {
          returnData.data.push({
            ...result,
            auditStatuses,
            auditSizes,
            name,
            isActive: (googleAuditHistoryData && googleAuditHistoryData[firstReviewIndex] !== 'Inactive') || false,
            isAudited: googleAuditHistoryData && !['Inactive', 'Waiting', 'Pre Audit'].includes(googleAuditHistoryData[firstReviewIndex]),
            lastValidAudit: auditStatuses.filter(item => !['WAITING', 'PRE AUDIT', 'INACTIVE'].includes(item)).length - 1,
          });
        }

      });

      setLoaded(true);
    }

    return returnData;
  }, [data, googleSheetsAuditHistory, googleSheetsAuditSizes]);

  return {
    results: parsedData,
    loading,
    loaded
  };
};

const useGoogleTrustLevels = (scale: string, mode: string) => {
  const [data, setData] = useState<IGoogleSheetResponse | undefined>(undefined)
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getGoogleSheetAllocatorsTrust().then((response) => {
      setData(response);
      setLoading(false);
    });
  }, []);

  const [loaded, setLoaded] = useState(false);

  const parsedData = useMemo(() => {

    if (!data?.values) {
      return [];
    }

    const returnData = [] as { [key: PropertyKey]: number | string }[];
    const [header] = data.values;

    const _firstMonthInxed = header.indexOf('March 2024');
    const _lastMonthIndex = header.length - 1;
    const isPercent = scale === 'percent';
    const isAllocator = mode === 'Count';

    for (let i = _firstMonthInxed; i <= _lastMonthIndex; i++) {
      const name = `${data?.values[0][i].split(" ")[0].substring(0, 3)} '${data?.values[0][i].split(" ")[1].substring(2, 4)}`;
      const unknownList = data?.values.filter(row => {
        return row[i].toUpperCase().startsWith('U-');
      });
      const unknown = isAllocator ? unknownList.length : unknownList.reduce((acc, row) => acc + +((row[i]).split("-")?.[1] ?? 0), 0) * PIB;

      const nonCompliantList = data?.values.filter(row => {
        return row[i].toUpperCase().startsWith('NC-');
      })
      const nonCompliant = isAllocator ? nonCompliantList.length : nonCompliantList.reduce((acc, row) => acc + +((row[i]).split("-")?.[1] ?? 0), 0) * PIB;

      const likelyCompliantList = data?.values.filter(row => {
        return row[i].toUpperCase().startsWith('LC-');
      })
      const likelyCompliant = isAllocator ? likelyCompliantList.length : likelyCompliantList.reduce((acc, row) => acc + +((row[i]).split("-")?.[1] ?? 0), 0) * PIB;

      const compliantList = data?.values.filter(row => {
        return row[i].toUpperCase().startsWith('C-');
      })
      const compliant = isAllocator ? compliantList.length : compliantList.reduce((acc, row) => acc + +((row[i]).split("-")?.[1] ?? 0), 0) * PIB;

      const total = unknown + nonCompliant + likelyCompliant + compliant;

      returnData.push({
        name,
        unknown: isPercent ? (unknown / total) * 100 : unknown,
        unknownName: 'Unknown',
        nonCompliant: isPercent ? (nonCompliant / total) * 100 : nonCompliant,
        nonCompliantName: 'Non Compliant',
        likelyCompliant: isPercent ? (likelyCompliant / total) * 100 : likelyCompliant,
        likelyCompliantName: 'Likely Compliant',
        compliant: isPercent ? (compliant / total) * 100 : compliant,
        compliantName: 'Compliant'
      });
    }

    setLoaded(true);
    return returnData;
  }, [data, scale, mode]);

  return {
    results: parsedData,
    loading,
    loaded
  };
}

const useAuditTimeline = (scale: string) => {
  const [data, setData] = useState<IGoogleSheetResponse | undefined>(undefined)
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoading(true);
    getGoogleSheetAuditTimeline().then((response) => {
      setData(response);
      setLoading(false);
    });
  }, []);

  const parsedData = useMemo(() => {
    const isPercent = scale === 'percent';

    if (!data?.values) {
      return [];
    }

    const returnData = [] as { [key: PropertyKey]: number | string }[];

    const [header, ...rows] = data.values;

    const _reviewIndex = header.indexOf('Review');
    const _reviewName = header.indexOf('Review Stage');
    const _conversationLengthIndex = header.indexOf('Conversation Length');
    const _auditTimeIndex = header.indexOf('Audit Time');
    const _outcomeIndex = header.indexOf('Outcome');

    const dataArray = rows.filter(item => item[_outcomeIndex].toLowerCase() !== 'waiting').map(item => ({
      reviewIndex: item[_reviewIndex],
      reviewName: item[_reviewName],
      conversationLength: item[_conversationLengthIndex],
      auditTime: item[_auditTimeIndex],
    }));

    const groupedArray = groupBy(dataArray, (item) => item.reviewIndex);

    Object.values(groupedArray).forEach((children) => {
      const reviewName = children[0].reviewName;
      const avgConversationLength = children.reduce((acc, row) => acc + +(row.conversationLength || 0), 0) / children.length;
      const avgAuditTime =  children.reduce((acc, row) => acc + +(row.auditTime || 0), 0) / children.length

      const total = avgAuditTime + avgConversationLength;

      returnData.push({
        name: reviewName,
        avgConversationLength: isPercent ? Math.round(avgConversationLength / total * 100) : Math.round(avgConversationLength),
        avgConversationLengthName: 'Average Conversation Length',
        avgAuditTime: isPercent ? Math.round(avgAuditTime / total * 100) : Math.round(avgAuditTime),
        avgAuditTimeName: 'Average Audit Length'
      });
    })

    setLoaded(true);

    return returnData;
  }, [data, scale]);

  return {
    results: parsedData,
    loading,
    loaded
  };
}


export {useGoogleSheetsAuditReport, useGoogleSheetFilters, useGoogleTrustLevels, useAuditTimeline};
