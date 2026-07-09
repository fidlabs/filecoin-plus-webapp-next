import { PoRepDealState } from "@/lib/cdp";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import { type ClassValue } from "class-variance-authority/types";
import { type HTMLAttributes } from "react";

type DealStateClassMap = Record<PoRepDealState, ClassValue>;

export interface DealStateBadgeProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  state: PoRepDealState;
}

const badgeClasses = cva(
  "pl-2 pr-3 py-1 border rounded-full inline-flex items-center gap-2 uppercase font-semibold",
  {
    variants: {
      state: {
        [PoRepDealState.PROPOSED]: "bg-gray-400/40 text-gray-500",
        [PoRepDealState.ACCEPTED]: "bg-yellow-500/40 text-yellow-600",
        [PoRepDealState.COMPLETED]: "bg-green-500/40 text-green-600",
        [PoRepDealState.REJECTED]: "bg-red-500/40 text-red-600",
        [PoRepDealState.TERMINATED]: "bg-purple-500/40 text-purple-600",
      } satisfies DealStateClassMap,
    },
  }
);

const dotClasess = cva("h-2 w-2 rounded-full", {
  variants: {
    state: {
      [PoRepDealState.PROPOSED]: "bg-gray-400",
      [PoRepDealState.ACCEPTED]: "bg-yellow-500",
      [PoRepDealState.COMPLETED]: "bg-green-500",
      [PoRepDealState.REJECTED]: "bg-red-500",
      [PoRepDealState.TERMINATED]: "bg-purple-500",
    } satisfies DealStateClassMap,
  },
});

const stateLabelDict: Record<PoRepDealState, string> = {
  [PoRepDealState.PROPOSED]: "Proposed",
  [PoRepDealState.ACCEPTED]: "Accepted",
  [PoRepDealState.COMPLETED]: "Completed",
  [PoRepDealState.REJECTED]: "Rejected",
  [PoRepDealState.TERMINATED]: "Terminated",
};

export function DealStateBadge({
  className,
  state,
  ...rest
}: DealStateBadgeProps) {
  return (
    <div {...rest} className={cn(badgeClasses({ state }), className)}>
      <div className={dotClasess({ state })} />
      <p className="text-xs leading-none mt-0.5">{stateLabelDict[state]}</p>
    </div>
  );
}
