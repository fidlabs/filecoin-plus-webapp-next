"use client";

import { Button } from "@/components/ui/button";
import { Card, CardFooter } from "@/components/ui/card";
import { Paginator } from "@/components/ui/pagination";
import { QueryKey } from "@/lib/constants";
import { calculateTimestampFromHeight } from "@/lib/utils";
import Link from "next/link";
import { parseAsInteger, useQueryState } from "nuqs";
import { useEffect, useMemo, useRef, type ComponentProps } from "react";
import useSWR from "swr";
import {
  fetchPoRepProviders,
  type FetchPoRepProvidersParameters,
} from "../po-rep-data";
import { ProviderSLIsGrid } from "./provider-slis-grid";
import { ProviderSpaceInfoBar } from "./provider-space-info-bar";
import { ProviderStatusBadge } from "./provider-status-badge";
import { useDelayedFlag } from "@/lib/hooks/use-delayed-flag";
import { OverlayLoader } from "@/components/overlay-loader";

type CardProps = ComponentProps<typeof Card>;
export type PoRepParticipantsWidgetProps = Omit<CardProps, "children">;

const pageQueryKey = "pp";
const pageSizeQueryKey = "pps";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function PoRepParticipantsWidget(props: PoRepParticipantsWidgetProps) {
  const headerRef = useRef<HTMLElement | null>(null);
  const [page, setPage] = useQueryState(
    pageQueryKey,
    parseAsInteger.withDefault(1)
  );
  const [pageSize, setPageSize] = useQueryState(
    pageSizeQueryKey,
    parseAsInteger.withDefault(5)
  );

  const parameters = useMemo<FetchPoRepProvidersParameters>(() => {
    return {
      page,
      limit: pageSize,
    };
  }, [page, pageSize]);

  const { data, error, isLoading, mutate } = useSWR(
    [QueryKey.PO_REP_PROVIDERS, parameters],
    ([, fetchParameters]) => {
      return fetchPoRepProviders(fetchParameters);
    },
    {
      keepPreviousData: true,
      revalidateOnMount: false,
    }
  );
  const isLongLoading = useDelayedFlag(isLoading, 500);
  const providers = data?.data ?? [];

  useEffect(() => {
    if (!data && !error && !isLoading) {
      mutate();
    }
  }, [data, error, isLoading, mutate]);

  useEffect(() => {
    if (headerRef.current !== null) {
      headerRef.current.scrollIntoView();
    }
  }, [page, pageSize]);

  return (
    <Card {...props}>
      <header className="px-4 pt-6 mb-4" ref={headerRef}>
        <h3 className="text-lg font-medium">Storage Providers</h3>
        <p className="text-xs text-muted-foreground">
          List of Storage Providers participating in PoRep Market
        </p>
      </header>

      <div className="relative">
        {!isLoading && !!error && (
          <div className="p-4">
            <p className="text-center text-sm text-muted-foreground">
              An error occured while loading the data. Please try again later.
            </p>
          </div>
        )}

        {!error &&
          providers.map((provider) => (
            <div
              key={provider.providerId}
              className="p-4 odd:bg-gray-100 border-b first:border-t"
            >
              <header className="mb-4">
                <Button asChild variant="link" className="text-md mb-1">
                  <Link href={`/storage-providers/${provider.providerId}`}>
                    {provider.providerId}
                  </Link>
                </Button>
                <div className="flex flex-wrap gap-2 items-center">
                  {!provider.paused && !provider.blocked && (
                    <ProviderStatusBadge variant="active" />
                  )}
                  {provider.paused && <ProviderStatusBadge variant="paused" />}
                  {provider.blocked && (
                    <ProviderStatusBadge variant="blocked" />
                  )}
                </div>
              </header>

              <ProviderSLIsGrid className="mb-4" slis={provider.slis} />

              <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
                {[
                  [
                    "Active Deals Count",
                    provider.activeDealsCount +
                      " deal" +
                      (provider.activeDealsCount === 1 ? "" : "s"),
                  ],
                  [
                    "Deal Duration",
                    `${provider.minDealDurationDays}-${provider.maxDealDurationDays} days`,
                  ],
                  [
                    "Registration Date",
                    dateFormatter.format(
                      calculateTimestampFromHeight(
                        parseInt(provider.registeredAtBlock)
                      ) * 1000
                    ),
                  ],
                ].map(([label, value], index) => (
                  <div key={index}>
                    <p className="text-sm font-semibold mb-1">{label}</p>
                    <p>{value}</p>
                  </div>
                ))}
              </div>

              <ProviderSpaceInfoBar
                availableBytes={provider.availableBytes}
                committedBytes={provider.committedBytes}
                pendingBytes={provider.pendingBytes}
              />
            </div>
          ))}

        <OverlayLoader show={isLongLoading} />
      </div>

      <CardFooter className="border-t w-full p-3">
        <Paginator
          page={page}
          pageSize={pageSize}
          pageSizeOptions={[5, 10, 20]}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          total={data?.pagination.total ?? 0}
        />
      </CardFooter>
    </Card>
  );
}
