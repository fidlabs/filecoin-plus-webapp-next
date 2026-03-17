"use client";

import {
  fetchAllocatorReports,
  FetchAllocatorReportsReturnType,
} from "@/app/allocators/allocators-data";
import { OverlayLoader } from "@/components/overlay-loader";
import { Button } from "@/components/ui/button";
import { Card, CardFooter } from "@/components/ui/card";
import { ChartLoader } from "@/components/ui/chart-loader";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/ui/data-table";
import { Paginator } from "@/components/ui/pagination";
import { generateAllocatorReport } from "@/lib/api";
import { QueryKey } from "@/lib/constants";
import { useDelayedFlag } from "@/lib/hooks/use-delayed-flag";
import { createColumnHelper, RowSelectionState } from "@tanstack/react-table";
import { LoaderCircleIcon } from "lucide-react";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { parseAsInteger, useQueryState } from "nuqs";
import {
  type ComponentProps,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";
import useSWR from "swr";

type Report = FetchAllocatorReportsReturnType[number];
type CardProps = ComponentProps<typeof Card>;
export interface AllocatorReportsWidgetProps
  extends Omit<CardProps, "children"> {
  allocatorId: string;
}

const pageSizeOptions = [10, 25, 50];
const pageKey = "rlp";
const pageSizeKey = "rlps";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});
const columnHelper = createColumnHelper<Report>();
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
    cell({ getValue, row }) {
      const reportId = getValue();

      return (
        <Link
          className="table-link"
          href={`/allocators/${row.original.allocator}/reports/${reportId}`}
        >
          {reportId}
        </Link>
      );
    },
  }),
  columnHelper.accessor("create_date", {
    header: "Created At",
    cell({ getValue }) {
      return dateFormatter.format(new Date(getValue()));
    },
  }),
];

export function AllocatorReportsWidget({
  allocatorId,
  ...rest
}: AllocatorReportsWidgetProps) {
  const { push: navigate } = useRouter();
  const [page, setPage] = useQueryState(pageKey, parseAsInteger.withDefault(1));
  const [limit, setLimit] = useQueryState(
    pageSizeKey,
    parseAsInteger.withDefault(10)
  );
  const [staleReportId, setStaleReportId] = useState<string>();
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [isGenerating, setIsGenerating] = useState(false);

  const handleFetchSuccess = useCallback(
    (data: FetchAllocatorReportsReturnType) => {
      const latestReportId = data[0].id;

      if (latestReportId !== staleReportId) {
        setStaleReportId(undefined);
      }
    },
    [staleReportId]
  );

  const { data, error, isLoading, mutate } = useSWR(
    [QueryKey.ALLOCATOR_REPORTS, allocatorId],
    ([, allocatorId]) => fetchAllocatorReports({ allocatorId }),
    {
      keepPreviousData: true,
      refreshInterval: staleReportId ? 5000 : undefined,
      revalidateOnMount: false,
      onSuccess: handleFetchSuccess,
    }
  );

  const isLongLoading = useDelayedFlag(isLoading, 500);
  const visibleReports = data
    ? data.slice((page - 1) * limit, page * limit)
    : [];

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
    navigate(`/allocators/${allocatorId}/reports/${selectedReports.join("/")}`);
  }, [allocatorId, navigate, selectedReports]);

  const handleGenerateReportButtonClick = useCallback(async () => {
    try {
      setIsGenerating(true);
      await generateAllocatorReport(allocatorId);
      setStaleReportId(data?.[0].id);
      revalidatePath(`/allocators/${allocatorId}`);
      toast.success("Report scheduled for generation");
    } catch (error) {
      toast.error("Could not generate a new report");
    } finally {
      setIsGenerating(false);
    }
  }, [allocatorId, data]);

  useEffect(() => {
    if (!data && !error && !isLoading) {
      mutate();
    }
  }, [data, error, isLoading, mutate]);

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

      <div className="relative">
        {!data && isLoading && (
          <div className="flex justify-center p-6">
            <ChartLoader />
          </div>
        )}

        {!isLoading && !!error && (
          <p className="text-center text-sm text-muted-foregorund">
            An error has occured. Please try again later.
          </p>
        )}

        {!!data && !error && (
          <>
            {actionsElement}
            <DataTable
              data={visibleReports}
              columns={columns}
              rowSelection={rowSelection}
              setRowSelection={setRowSelection}
            />
            {actionsElement}
            <OverlayLoader show={isLongLoading} />
          </>
        )}
      </div>

      <CardFooter className="border-t w-full p-3">
        <Paginator
          page={page}
          pageSize={limit}
          pageSizeOptions={pageSizeOptions}
          onPageChange={setPage}
          onPageSizeChange={setLimit}
          total={data?.length ?? 0}
        />
      </CardFooter>
    </Card>
  );
}
