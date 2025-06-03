"use client";

import { useCallback } from "react";
import { SortingButton, SortingButtonProps } from "./sorting-button";

type Direction = "asc" | "desc";

export interface DataTableSortProps
  extends Omit<SortingButtonProps, "descending" | "sorted"> {
  direction?: Direction;
  onSort?(direction: Direction): void;
}

export const DataTableSort = ({
  direction,
  onSort,
  ...rest
}: DataTableSortProps) => {
  const handleSortChange = useCallback(() => {
    const nextDirection = direction === "desc" ? "asc" : "desc";
    onSort?.(nextDirection);
  }, [direction, onSort]);

  return (
    <SortingButton
      {...rest}
      descending={direction === "desc"}
      sorted={!!direction}
      onClick={handleSortChange}
    />
  );
};
