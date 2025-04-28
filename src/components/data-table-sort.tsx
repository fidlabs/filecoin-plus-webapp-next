"use client";

import { cn } from "@/lib/utils";
import { ChevronDownIcon } from "lucide-react";
import { HTMLAttributes, useCallback } from "react";
import { Button } from "./ui/button";

type Direction = "asc" | "desc";

type BaseProps = HTMLAttributes<HTMLDivElement>;
export interface DataTableSortProps extends BaseProps {
  direction?: Direction;
  onSort?(direction: Direction): void;
}

export const DataTableSort = ({
  children,
  direction,
  onSort,
}: DataTableSortProps) => {
  const handleSortChange = useCallback(() => {
    const nextDirection = direction === "desc" ? "asc" : "desc";
    onSort?.(nextDirection);
  }, [direction, onSort]);

  return (
    <Button
      variant="ghost"
      className={cn("group p-0 hover:bg-transparent gap-1")}
      onClick={handleSortChange}
    >
      {children}

      <ChevronDownIcon
        className={cn(
          "h-4 w-4",
          direction === "asc" && "rotate-180",
          typeof direction === "undefined" && "opacity-0 group-hover:opacity-50"
        )}
      />
    </Button>
  );
};
