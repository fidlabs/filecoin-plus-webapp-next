"use client";

import { ClientsViewTable } from "@/app/allocators/(pages)/[id]/(pages)/reports/(pages)/[...report]/components/clients-view/clients-view-table";
import { useReportsDetails } from "@/app/allocators/(pages)/[id]/(pages)/reports/(pages)/[...report]/providers/reports-details.provider";
import { HealthCheck } from "@/components/health-check";
import { useScrollObserver } from "@/lib/hooks/useScrollObserver";
import { IAllocatorReportClientPaginationQuery } from "@/lib/interfaces/api.interface";
import {
  AllocatorReportCheckType,
  ClientReportCheckType,
} from "@/lib/interfaces/cdp/cdp.interface";
import { cn } from "@/lib/utils";
import { CheckIcon, TriangleAlertIcon } from "lucide-react";

const checkTypes = [
  AllocatorReportCheckType.CLIENT_MULTIPLE_ALLOCATORS,
  AllocatorReportCheckType.CLIENT_NOT_ENOUGH_COPIES,

  ClientReportCheckType.STORAGE_PROVIDER_DISTRIBUTION_ALL_LOCATED_IN_THE_SAME_REGION,
  ClientReportCheckType.STORAGE_PROVIDER_DISTRIBUTION_PROVIDERS_EXCEED_PROVIDER_DEAL,
  ClientReportCheckType.STORAGE_PROVIDER_DISTRIBUTION_PROVIDERS_EXCEED_MAX_DUPLICATION,
  ClientReportCheckType.STORAGE_PROVIDER_DISTRIBUTION_PROVIDERS_UNKNOWN_LOCATION,
  ClientReportCheckType.STORAGE_PROVIDER_DISTRIBUTION_PROVIDERS_RETRIEVABILITY_ZERO,
  ClientReportCheckType.STORAGE_PROVIDER_DISTRIBUTION_PROVIDERS_RETRIEVABILITY_75,
  ClientReportCheckType.STORAGE_PROVIDER_URL_FINDER_RETRIEVABILITY_ZERO,
  ClientReportCheckType.STORAGE_PROVIDER_URL_FINDER_RETRIEVABILITY_75,
  ClientReportCheckType.DEAL_DATA_REPLICATION_LOW_REPLICA,
  ClientReportCheckType.DEAL_DATA_REPLICATION_CID_SHARING,
  ClientReportCheckType.STORAGE_PROVIDER_DISTRIBUTION_PROVIDERS_IPNI_MISREPORTING,
  ClientReportCheckType.STORAGE_PROVIDER_DISTRIBUTION_PROVIDERS_IPNI_NOT_REPORTING,
  ClientReportCheckType.MULTIPLE_ALLOCATORS,
  ClientReportCheckType.NOT_ENOUGH_COPIES,
  ClientReportCheckType.INACTIVITY,
  ClientReportCheckType.UNIQ_DATA_SET_SIZE_TO_DECLARED,
  ClientReportCheckType.DEAL_DATA_REPLICATION_HIGH_REPLICA,
];

export function ClientsView({
  queryParams,
}: {
  queryParams?: IAllocatorReportClientPaginationQuery;
}) {
  const { colsStyle, colsSpanStyle, reports } = useReportsDetails();
  const { top, ref } = useScrollObserver();

  const showMutipleAllocatorsExplanation = reports.some((report) => {
    return report.check_results.some((result) => {
      return (
        result.check === AllocatorReportCheckType.CLIENT_MULTIPLE_ALLOCATORS &&
        result.metadata.violating_ids.length > 0
      );
    });
  });

  return (
    <div className="grid" style={colsStyle}>
      <div
        ref={ref}
        className={cn(
          "p-4 border-b sticky top-[147px] bg-white",
          top > 90 && "z-[5]",
          top === 147 && "shadow-md"
        )}
        style={colsSpanStyle}
      >
        <h2 className="font-semibold text-lg">Clients overview</h2>

        <p className="text-sm mt-2">
          Clients marked with{" "}
          <CheckIcon className="inline h-4 w-4 text-green-500" /> are using
          Client contract.
        </p>

        {showMutipleAllocatorsExplanation && (
          <p className="text-sm mt-2">
            Clients marked with{" "}
            <TriangleAlertIcon className="inline h-4 w-4 text-yellow-600" />{" "}
            received DataCap from more than one allocator.
          </p>
        )}
      </div>

      {reports.map((report, index) => {
        const idsUsingContract = report.clients.data
          .filter((client) => !client.not_found && client.using_client_contract)
          .map((client) => client.client_id);

        const idsReceivingDatacapFromMultipleAllocators =
          report.check_results.find((result) => {
            return (
              result.check ===
              AllocatorReportCheckType.CLIENT_MULTIPLE_ALLOCATORS
            );
          })?.metadata.violating_ids;

        const idsWithNotEnoughReplicas =
          report.check_results.find((result) => {
            return (
              result.check === AllocatorReportCheckType.CLIENT_NOT_ENOUGH_COPIES
            );
          })?.metadata.violating_ids ?? [];

        const foundClients = report.clients.data.filter(
          (client) => !client.not_found
        );

        return (
          <div key={index} className="border-b [&:not(:last-child)]:border-r-2">
            <HealthCheck
              security={report.check_results.filter((checkResult) =>
                checkTypes.includes(checkResult.check)
              )}
            />
            <ClientsViewTable
              clients={foundClients}
              idsUsingContract={idsUsingContract}
              idsReceivingDatacapFromMultipleAllocators={
                idsReceivingDatacapFromMultipleAllocators
              }
              idsWithNotEnoughReplicas={idsWithNotEnoughReplicas}
              queryParams={queryParams}
              totalPages={report.clients.pagination?.total}
            />
          </div>
        );
      })}
    </div>
  );
}
