"use client";

import { ChartStat } from "@/components/chart-stat";
import { OverlayLoader } from "@/components/overlay-loader";
import { Button } from "@/components/ui/button";
import { Card, type CardProps } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Input } from "@/components/ui/input";
import { Paginator } from "@/components/ui/pagination";
import { QueryKey } from "@/lib/constants";
import { useDelayedFlag } from "@/lib/hooks/use-delayed-flag";
import { createColumnHelper } from "@tanstack/react-table";
import { filesize } from "filesize";
import { CheckIcon, CrossIcon, XIcon } from "lucide-react";
import Link from "next/link";
import {
  ChangeEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import useSWR from "swr";
import { useDebounceCallback } from "usehooks-ts";
import {
  fetchClientLatestClaims,
  type FetchClientLatestClaimsParameters,
  type FetchClientLatestClaimsReturnType,
} from "../../clients-data";
import { ClientLatestClaimsCSVExportButton } from "./client-latest-claims-csv-export-button";

type ClaimInfo = FetchClientLatestClaimsReturnType["data"][number];

export interface LatestClaimsProps extends Omit<CardProps, "children"> {
  initialParameters: FetchClientLatestClaimsParameters;
}

const pageSizeOptions = [15, 25, 50];
const columnHelper = createColumnHelper<ClaimInfo>();
const columns = [
  columnHelper.accessor("pieceCid", {
    header: "Piece CID",
    cell(info) {
      const pieceCid = info.getValue();

      return (
        <>
          <HoverCard>
            <HoverCardTrigger>
              <p className="sm:hidden">
                {pieceCid.substring(0, 5)}...{pieceCid.slice(-5)}
              </p>
              <p className="hidden sm:block md:hidden">
                {pieceCid.substring(0, 10)}...{pieceCid.slice(-10)}
              </p>
            </HoverCardTrigger>
            <HoverCardContent>
              <p className="break-words">{pieceCid}</p>
            </HoverCardContent>
          </HoverCard>
          <p className="hidden md:block">{pieceCid}</p>
        </>
      );
    },
  }),
  columnHelper.accessor("providerId", {
    header: "Storage Provider ID",
    cell(info) {
      const providerId = "f0" + info.getValue();

      return (
        <Link className="table-link" href={`/storage-providers/${providerId}`}>
          {providerId}
        </Link>
      );
    },
  }),
  columnHelper.accessor("isDDO", {
    header: "Is DDO",
    cell(info) {
      const isDDO = info.getValue();

      return (
        <div className="flex items-center gap-1">
          {isDDO ? (
            <CheckIcon className="h-4 w-4" />
          ) : (
            <CrossIcon className="h-4 w-4" />
          )}
          <p>{isDDO ? "Yes" : "No"}</p>
        </div>
      );
    },
  }),
  columnHelper.accessor("pieceSize", {
    header: "Size",
    cell(info) {
      return filesize(info.getValue(), { standard: "iec" });
    },
  }),
  columnHelper.accessor("createdAt", {
    header: "Date",
    cell(info) {
      const createDate = new Date(info.getValue());

      if (isNaN(Number(createDate))) {
        return "N/A";
      }

      return createDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
    },
  }),
];

export function ClientLatestClaimsWidget({
  initialParameters,
  ...rest
}: LatestClaimsProps) {
  const widgetRef = useRef<HTMLDivElement | null>(null);
  const [searchPhrase, setSearchPhrase] = useState(
    initialParameters.filter ?? ""
  );
  const [parameters, setParameters] = useState(initialParameters);
  const { data: claimsResponse, isLoading } = useSWR(
    [QueryKey.CLIENT_LATEST_CLAIMS, parameters],
    ([, fetchParameters]) => fetchClientLatestClaims(fetchParameters),
    {
      keepPreviousData: true,
    }
  );
  const isLongLoading = useDelayedFlag(isLoading, 500);

  const scrollToListTop = useCallback(() => {
    if (widgetRef.current) {
      widgetRef.current.scrollIntoView({
        block: "start",
      });
    }
  }, []);

  const handlePageChange = useCallback(
    (page: number) => {
      setParameters((currentParameters) => ({
        ...currentParameters,
        page,
        limit: currentParameters.limit ?? pageSizeOptions[0],
      }));

      scrollToListTop();
    },
    [scrollToListTop]
  );

  const handlePageSizeChange = useCallback(
    (pageSize: number) => {
      setParameters((currentParameters) => ({
        ...currentParameters,
        page: 1,
        limit: pageSize,
      }));

      scrollToListTop();
    },
    [scrollToListTop]
  );

  const handleSearchInputChange = useCallback<
    ChangeEventHandler<HTMLInputElement>
  >((event) => {
    setSearchPhrase(event.target.value);
  }, []);

  const search = useCallback((searchPhrase: string) => {
    setParameters((currentParameters) => ({
      ...currentParameters,
      filter: searchPhrase === "" ? undefined : searchPhrase,
      page: 1,
      limit: currentParameters.limit ?? pageSizeOptions[0],
    }));
  }, []);

  const searchDebounced = useDebounceCallback(search, 200);

  const clearSearch = useCallback(() => {
    setSearchPhrase("");
  }, []);

  useEffect(() => {
    searchDebounced(searchPhrase);
  }, [searchDebounced, searchPhrase]);

  return (
    <Card {...rest} ref={widgetRef}>
      <header className="p-4 flex flex-wrap items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Latest Claims</h3>
          <p className="text-xs text-muted-foreground">
            Browse Client&apos;s latest claims
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="relative w-[270px]">
            <Input
              className="bg-background w-full text-sm"
              placeholder="Search by SP ID or Piece CID..."
              value={searchPhrase}
              onChange={handleSearchInputChange}
            />
            {!!parameters.filter && parameters.filter.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-0 right-0"
                onClick={clearSearch}
              >
                <XIcon className="h-4 w-4" />
              </Button>
            )}
          </div>

          <ClientLatestClaimsCSVExportButton
            clientId={parameters.clientId}
            filter={parameters.filter}
          />
        </div>
      </header>

      <div className="p-4 flex flex-wrap gap-8">
        <ChartStat
          label="Sum of DDO Piece Size"
          value={
            !!claimsResponse && !isLongLoading
              ? filesize(claimsResponse.totalSumOfDdoPieceSize, {
                  standard: "iec",
                })
              : null
          }
        />

        <ChartStat
          label="Sum of non-DDO Piece Size"
          value={
            !!claimsResponse && !isLongLoading
              ? filesize(claimsResponse.totalSumOfNonDdoPieceSize, {
                  standard: "iec",
                })
              : null
          }
        />
      </div>
      <div className="pb-4 relative">
        <DataTable columns={columns} data={claimsResponse?.data ?? []} />
        <OverlayLoader show={!claimsResponse || isLongLoading} />
      </div>
      <div className="p-4">
        <Paginator
          page={parameters.page ?? 1}
          pageSize={parameters.limit ?? 15}
          pageSizeOptions={pageSizeOptions}
          total={claimsResponse?.pagination.total ?? 0}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>
    </Card>
  );
}
