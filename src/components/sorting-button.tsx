"use client";

import { cn } from "@/lib/utils";
import { ChevronDownIcon } from "lucide-react";
import { Button, ButtonProps } from "./ui/button";

export interface SortingButtonProps extends ButtonProps {
  descending: boolean;
  sorted: boolean;
}

export function SortingButton({
  children,
  descending,
  sorted,
  ...rest
}: SortingButtonProps) {
  return (
    <Button
      variant="ghost"
      {...rest}
      className={cn("group p-0 hover:bg-transparent gap-1")}
    >
      {children}

      <ChevronDownIcon
        className={cn(
          "h-4 w-4",
          !descending && "rotate-180",
          !sorted && "opacity-0 group-hover:opacity-50"
        )}
      />
    </Button>
  );
}
