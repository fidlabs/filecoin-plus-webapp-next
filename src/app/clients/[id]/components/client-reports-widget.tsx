"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/ui/data-table";
import { Paginator } from "@/components/ui/pagination";
import { generateClientReport } from "@/lib/api";
import { QueryKey } from "@/lib/constants";
import {
  createColumnHelper,
  PaginationState,
  type RowSelectionState,
} from "@tanstack/react-table";
import { LoaderCircleIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState, type ComponentProps } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import {
  fetchClientReports,
  FetchClientReportsReturnType,
} from "../../clients-data";

type CardProps = ComponentProps<typeof Card>;
export interface ClientReportsWidgetProps extends Omit<CardProps, "children"> {
  clientId: string;
}

const columnHelper = createColumnHelper<FetchClientReportsReturnType[number]>();
const columns = [
  columnHelper.display({
    id: "selection",
    size: 40,
    cell(info) {
      return (
        <span>
          <Checkbox
            checked={info.row.getIsSelected()}
            onCheckedChange={(checkedState) =>
              info.row.toggleSelected(checkedState === true)
            }
            aria-label="Select Row"
          />
        </span>
      );
    },
  }),
  columnHelper.accessor("id", {
    header: "Report ID",
    cell(info) {
      const reportId = info.getValue();

      return (
        <Button variant="link" asChild>
          <Link
            href={`/clients/${info.row.original.client}/reports/${reportId}`}
          >
            {reportId}
          </Link>
        </Button>
      );
    },
  }),
  columnHelper.accessor("create_date", {
    header: "Created At",
    cell(info) {
      return new Date(info.getValue()).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    },
  }),
];

const pageSizeOptions = [10, 25, 50];

export function ClientReportsWidget({
  clientId,
  ...rest
}: ClientReportsWidgetProps) {
  const { push: navigate } = useRouter();
  const [staleReportId, setStaleReportId] = useState<string>();
  const [isGenerating, setIsGenerating] = useState(false);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: pageSizeOptions[0],
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const handleFetchSuccess = useCallback(
    (data: FetchClientReportsReturnType) => {
      const latestReportId = data[0].id;

      if (latestReportId !== staleReportId) {
        setStaleReportId(undefined);
      }
    },
    [staleReportId]
  );

  const { data, error } = useSWR(
    [QueryKey.CLIENT_REPORTS, { clientId }],
    ([, fetchParameters]) => fetchClientReports(fetchParameters),
    {
      keepPreviousData: true,
      refreshInterval: staleReportId ? 5000 : undefined,
      onSuccess: handleFetchSuccess,
    }
  );

  const handlePageChange = useCallback((page: number) => {
    setPagination((currentPagiantion) => ({
      ...currentPagiantion,
      pageIndex: page - 1,
    }));
  }, []);

  const handlePageSizeChange = useCallback((pageSize: number) => {
    setPagination({
      pageIndex: 0,
      pageSize,
    });
  }, []);

  const selectedReports = useMemo(() => {
    if (!data) {
      return [];
    }

    return Object.entries(rowSelection)
      .filter(([, selected]) => selected)
      .map(([index]) => {
        return data[parseInt(index)]?.id;
      })
      .filter((maybeReportId): maybeReportId is string => !!maybeReportId);
  }, [data, rowSelection]);

  const handleCompareButtonPress = useCallback(() => {
    navigate(`/clients/${clientId}/reports/${selectedReports.join("/")}`);
  }, [clientId, navigate, selectedReports]);

  const handleGenerateReportButtonClick = useCallback(async () => {
    try {
      setIsGenerating(true);
      await generateClientReport(clientId);
      setStaleReportId(data?.[0].id);
      toast.success("Report scheduled for generation");
    } catch (error) {
      toast.error("Could not generate a new report");
    } finally {
      setIsGenerating(false);
    }
  }, [clientId, data]);

  const actionsElement = (
    <div className="px-4 py-2 flex flex-wrap items-center gap-4 border-y">
      <Button
        variant="outline"
        disabled={selectedReports.length < 2}
        size="sm"
        onClick={handleCompareButtonPress}
      >
        {selectedReports.length < 2
          ? "Compare Reports"
          : `Compare ${selectedReports.length} reports`}
      </Button>

      <Button
        className="gap-2"
        variant="outline"
        size="sm"
        disabled={isGenerating}
        onClick={handleGenerateReportButtonClick}
      >
        Generate Report
        {isGenerating && <LoaderCircleIcon className="animated animate-spin" />}
      </Button>
    </div>
  );

  return (
    <Card {...rest}>
      <header className="p-4 flex items-center gap-4 justify-between">
        <div>
          <h3 className="text-lg font-medium">Reports</h3>
          <p className="text-xs text-muted-foreground">
            Click on report ID to view details. Select multiple reports to
            compare them.
          </p>
        </div>

        {!!staleReportId && (
          <LoaderCircleIcon
            size={32}
            className="animate-spin text-muted-foreground"
          />
        )}
      </header>

      {!!error && (
        <div className="px-4 py-8">
          <p className="text-center text-sm text-muted-foreground">
            Could not load reports. Please try again later.
          </p>
        </div>
      )}

      {actionsElement}

      <DataTable
        data={data ?? []}
        columns={columns}
        rowSelection={rowSelection}
        setRowSelection={setRowSelection}
        pagination={pagination}
      />

      {actionsElement}

      <div className="p-4">
        <Paginator
          page={pagination.pageIndex + 1}
          pageSize={pagination.pageSize}
          total={data?.length ?? 0}
          pageSizeOptions={pageSizeOptions}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>
    </Card>
  );
}
