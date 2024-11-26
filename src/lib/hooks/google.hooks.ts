import {useCallback, useMemo, useState} from "react";
import {useAsync} from "@/lib/hooks/useAsync";
import {getAllocators, getGoogleSheetAuditHistory} from "@/lib/api";
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

  const {data, loading: dataLoading } = useAsync<IAllocatorsResponse>(
    () => getAllocators({showInactive: 'false'})
  );

  const {data: googleSheetsData, loading: googleLoading } = useAsync<IGoogleSheetResponse>(getGoogleSheetAuditHistory);

  const loading = useMemo(() => dataLoading || googleLoading, [dataLoading, googleLoading]);

  const parsedData = useMemo(() => {
    setLoaded(false);
    const returnData = {
      audits: 0,
      data: []
    } as IAllocatorsWithSheetInfo;

    if (data?.data && googleSheetsData?.values) {
      const allocatorIdIndex = googleSheetsData.values[0].indexOf('Allocator ID');
      const firstReviewIndex = googleSheetsData.values[0].indexOf('1');

      returnData.audits = +(googleSheetsData.values[0][googleSheetsData.values[0].length - 1]);

      if (allocatorIdIndex === -1) {
        throw new Error('Allocator ID column not found in google sheets data');
      }


      data?.data.forEach((result) => {
        const googleSheetData = googleSheetsData?.values.find((data) => data[allocatorIdIndex] === result.addressId);
        const auditStatuses = googleSheetData ? googleSheetData.slice(firstReviewIndex).map(item => item.toUpperCase()) : []

        returnData.data.push({
          ...result,
          auditStatuses,
          isActive: (googleSheetData && googleSheetData[firstReviewIndex] !== 'Inactive') || false,
          isAudited: googleSheetData && !['Inactive', 'Waiting', 'Pre Audit'].includes(googleSheetData[firstReviewIndex]),
          lastValidAudit : auditStatuses.filter(item => !['WAITING', 'PRE AUDIT', 'INACTIVE'].includes(item)).length - 1,
        });
      });

      setLoaded(true);
    }
    return returnData;
  }, [data, googleSheetsData]);

  return {
    results: parsedData,
    loading,
    loaded
  };
};

export { useGoogleSheetsAuditReport, useGoogleSheetFilters };
