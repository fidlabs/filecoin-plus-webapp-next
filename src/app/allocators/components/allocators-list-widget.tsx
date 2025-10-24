"use client";

import { OverlayLoader } from "@/components/overlay-loader";
import { Card, CardFooter } from "@/components/ui/card";
import { Paginator, PaginatorProps } from "@/components/ui/pagination";
import { QueryKey } from "@/lib/constants";
import { useDelayedFlag } from "@/lib/hooks/use-delayed-flag";
import { useCallback, useMemo, useState, type ComponentProps } from "react";
import useSWR from "swr";
import { fetchAllocators, FetchAllocatorsParameters } from "../allocators-data";
import { AllocatorsList, AllocatorsListProps } from "./allocators-list";
import {
  AllocatorsListAddons,
  AllocatorsListAddonsProps,
} from "./allocators-list-addons";
import { Checkbox } from "@/components/ui/checkbox";

type CardProps = ComponentProps<typeof Card>;
export interface AllocatorsListWidgetProps extends Omit<CardProps, "children"> {
  defaultParameters?: FetchAllocatorsParameters;
}

type CheckboxProps = ComponentProps<typeof Checkbox>;
type CheckedChangeHandler = NonNullable<CheckboxProps["onCheckedChange"]>;

const pageSizeOptions = [10, 25, 50];

export function AllocatorsListWidget({
  defaultParameters = {},
  ...rest
}: AllocatorsListWidgetProps) {
  const [parameters, setParameters] = useState(defaultParameters);
  const { data, isLoading } = useSWR(
    [QueryKey.ALLOCATORS_LIST, parameters],
    ([, fetchParameters]) => fetchAllocators(fetchParameters),
    {
      keepPreviousData: true,
      revalidateOnMount: false,
    }
  );
  const isLongLoading = useDelayedFlag(isLoading, 1000);

  const sorting: AllocatorsListProps["sorting"] = useMemo(() => {
    if (!parameters.sort || !parameters.order) {
      return null;
    }

    return {
      key: parameters.sort,
      direction: parameters.order,
    };
  }, [parameters.sort, parameters.order]);

  const handleShowInactiveToggle = useCallback<CheckedChangeHandler>(
    (checkedState) => {
      if (checkedState === "indeterminate") {
        return;
      }

      setParameters((currentParameters) => ({
        ...currentParameters,
        showInactive: checkedState,
        page: 1,
      }));
    },
    []
  );

  const handleSearch = useCallback<AllocatorsListAddonsProps["onSearch"]>(
    (searchPhrase) => {
      setParameters((currentParameters) => ({
        ...currentParameters,
        filter: searchPhrase,
        page: 1,
      }));
    },
    []
  );

  const handleSort = useCallback<AllocatorsListProps["onSort"]>(
    (sort, order) => {
      setParameters((currentParameters) => ({
        ...currentParameters,
        sort,
        order,
      }));
    },
    []
  );

  const handlePageChange = useCallback<PaginatorProps["onPageChange"]>(
    (page) => {
      setParameters((currentParameters) => ({
        ...currentParameters,
        page,
      }));
    },
    []
  );

  const handlePageSizeChange = useCallback<
    NonNullable<PaginatorProps["onPageSizeChange"]>
  >((limit) => {
    setParameters((currentParameters) => ({
      ...currentParameters,
      limit,
    }));
  }, []);

  return (
    <Card {...rest}>
      <div className="px-4 pt-6 mb-2 gap-4 flex flex-wrap items-center justify-between">
        <div>
          <h2 className="text-lg font-medium">Allocators List</h2>
          <p className="text-xs text-muted-foreground">
            Browse Allocators participating in Filecoin. Select to see details.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="show-inactive"
              checked={!!parameters.showInactive}
              onCheckedChange={handleShowInactiveToggle}
            />
            <label
              className="text-sm font-medium leading-none"
              htmlFor="show-inactive"
            >
              Show Inactive
            </label>
          </div>

          <AllocatorsListAddons
            className="flex-grow-1"
            onSearch={handleSearch}
          />
        </div>
      </div>

      <div className="relative">
        <AllocatorsList
          allocators={data?.data ?? []}
          sorting={sorting}
          onSort={handleSort}
        />
        <OverlayLoader show={!data || isLongLoading} />
      </div>

      <CardFooter className="border-t w-full p-3">
        <Paginator
          page={parameters.page ?? 1}
          pageSize={parameters.limit ?? pageSizeOptions[0]}
          pageSizeOptions={pageSizeOptions}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          total={data?.count ?? 0}
        />
      </CardFooter>
    </Card>
  );
}
