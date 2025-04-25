"use client";

import { useSearchParams } from "next/navigation";
import { DataTableSort, type DataTableSortProps } from "./data-table-sort";
import { useCallback, useMemo } from "react";

type SortHandler = NonNullable<DataTableSortProps["onSort"]>;

export interface DMOBDataTableSortProps
  extends Omit<DataTableSortProps, "direction" | "onSort"> {
  property: string;
  onSort(property: string, direction: "0" | "1"): void;
}

export const DMOBDataTableSort = ({
  children,
  property,
  onSort,
  ...rest
}: DMOBDataTableSortProps) => {
  const query = useSearchParams();

  const direction = useMemo(() => {
    if (!query.get("sort")) {
      return undefined;
    }
    const sortParts = query.get("sort")?.split(",") ?? [];
    const selectedProperty = sortParts[0]?.replace(/[\[\]"]+/g, "");
    const direction = sortParts[1][0];

    if (selectedProperty === property) {
      return direction;
    }
    return undefined;
  }, [query, property]);

  const handleSort = useCallback<SortHandler>(
    (direction) => {
      onSort(property, direction === "asc" ? "1" : "0");
    },
    [property, onSort]
  );

  return (
    <DataTableSort
      {...rest}
      direction={
        direction === "0" ? "desc" : direction === "1" ? "asc" : undefined
      }
      onSort={handleSort}
    >
      {children}
    </DataTableSort>
  );
};
