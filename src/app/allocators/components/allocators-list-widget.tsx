"use client";

import { OverlayLoader } from "@/components/overlay-loader";
import { Card, CardFooter } from "@/components/ui/card";
import { Paginator, PaginatorProps } from "@/components/ui/pagination";
import { QueryKey } from "@/lib/constants";
import { useDelayedFlag } from "@/lib/hooks/use-delayed-flag";
import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
} from "react";
import useSWR from "swr";
import { fetchAllocators, FetchAllocatorsParameters } from "../allocators-data";
import { AllocatorsList, AllocatorsListProps } from "./allocators-list";
import {
  AllocatorsListAddons,
  AllocatorsListAddonsProps,
} from "./allocators-list-addons";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type CardProps = ComponentProps<typeof Card>;
export interface AllocatorsListWidgetProps extends Omit<CardProps, "children"> {
  defaultParameters?: FetchAllocatorsParameters;
}

type CheckboxProps = ComponentProps<typeof Checkbox>;
type CheckedChangeHandler = NonNullable<CheckboxProps["onCheckedChange"]>;
type DataType = NonNullable<FetchAllocatorsParameters["dataType"]>;

const pageSizeOptions = [10, 25, 50];
const allowedDataTypes = ["openData", "enterprise"] satisfies DataType[];
const dataTypeDict: Record<DataType, string> = {
  openData: "Open Data",
  enterprise: "Enterprise Data",
};

export function AllocatorsListWidget({
  defaultParameters = {},
  ...rest
}: AllocatorsListWidgetProps) {
  const widgetRef = useRef<HTMLDivElement | null>(null);
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

  const scrollToListTop = useCallback(() => {
    if (widgetRef.current) {
      widgetRef.current.scrollIntoView({
        block: "start",
      });
    }
  }, []);

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

      scrollToListTop();
    },
    [scrollToListTop]
  );

  const handlePageSizeChange = useCallback<
    NonNullable<PaginatorProps["onPageSizeChange"]>
  >((limit) => {
    setParameters((currentParameters) => ({
      ...currentParameters,
      limit,
    }));
  }, []);

  const handleEditionChange = useCallback((value: string) => {
    setParameters((currentParameters) => ({
      ...currentParameters,
      editionId: value === "all" ? undefined : value,
    }));
  }, []);

  const handleDataTypeChange = useCallback((value: string) => {
    setParameters((currentParameters) => ({
      ...currentParameters,
      dataType: isAllowedDataType(value) ? value : undefined,
    }));
  }, []);

  return (
    <Card {...rest} ref={widgetRef}>
      <div className="px-4 pt-6 mb-2 gap-4 flex flex-wrap items-center justify-between">
        <div>
          <h2 className="text-lg font-medium">Allocators List</h2>
          <p className="text-xs text-muted-foreground">
            Browse Allocators participating in Filecoin. Select to see details.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center space-x-2 mr-2">
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

          <Select
            value={parameters.editionId ?? "all"}
            onValueChange={handleEditionChange}
          >
            <SelectTrigger className="bg-background min-w-[122px]">
              <SelectValue placeholder="All Editions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Editions</SelectItem>
              <SelectItem value="5">Edition 5</SelectItem>
              <SelectItem value="6">Edition 6</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={parameters.dataType ?? "all"}
            onValueChange={handleDataTypeChange}
          >
            <SelectTrigger className="bg-background min-w-[152px]">
              <SelectValue placeholder="All Data Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Data Types</SelectItem>
              {allowedDataTypes.map((dataType) => (
                <SelectItem key={dataType} value={dataType}>
                  {dataTypeDict[dataType]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

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

function isAllowedDataType(value: string): value is DataType {
  return (allowedDataTypes as string[]).includes(value);
}
