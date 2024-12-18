import {useCallback, useMemo, useState} from "react";
import {useAsync} from "@/lib/hooks/useAsync";
import {
  getAllocators,
  getGoogleSheetAllocatorsTrust,
  getGoogleSheetAuditHistory,
  getGoogleSheetAuditHistorySizes
} from "@/lib/api";
import {IAllocatorsResponse} from "@/lib/interfaces/dmob/allocator.interface";
import {
  IAllocatorsWithSheetInfo,
  IAllocatorWithSheetInfo,
  IGoogleSheetResponse
} from "@/lib/interfaces/cdp/google.interface";

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

  const {data, loading: dataLoading} = useAsync<IAllocatorsResponse>(
    () => getAllocators({showInactive: 'false'})
  );

  const {
    data: googleSheetsAuditHistory,
    loading: googleSheetsAuditHistoryLoading
  } = useAsync<IGoogleSheetResponse>(getGoogleSheetAuditHistory);
  const {
    data: googleSheetsAuditSizes,
    loading: googleSheetsAuditSizesLoading
  } = useAsync<IGoogleSheetResponse>(getGoogleSheetAuditHistorySizes);

  const loading = useMemo(() => dataLoading || googleSheetsAuditHistoryLoading || googleSheetsAuditSizesLoading, [dataLoading, googleSheetsAuditHistoryLoading, googleSheetsAuditSizesLoading]);

  const parsedData = useMemo(() => {
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

const useGoogleTrustLevels = () => {
  const {
    data,
    loading
  } = useAsync<IGoogleSheetResponse>(getGoogleSheetAllocatorsTrust);

  const [loaded, setLoaded] = useState(false);

  const parsedData = useMemo(() => {

    if (!data?.values) {
      return [];
    }

    const returnData = [] as {[key: PropertyKey]: string}[];

    const _firstMonthInxed = data?.values[0].indexOf('March');
    const _lastMonthIndex = data?.values[0].length - 1;

    for (let i = _firstMonthInxed; i <= _lastMonthIndex; i++) {
      const name = data?.values[0][i];
      returnData.push({
        name,
        notAudited: data?.values[1][i],
        notAuditedName: data?.values[1][_firstMonthInxed - 1],
        failed: data?.values[2][i],
        failedName: data?.values[2][_firstMonthInxed - 1],
        partial: data?.values[3][i],
        partialName: data?.values[3][_firstMonthInxed - 1],
        pass: data?.values[4][i],
        passName: data?.values[4][_firstMonthInxed - 1],
      });
    }

    setLoaded(true);
    return returnData;
  }, [data]);

  return {
    results: parsedData,
    loading,
    loaded
  };
}

export {useGoogleSheetsAuditReport, useGoogleSheetFilters, useGoogleTrustLevels};
