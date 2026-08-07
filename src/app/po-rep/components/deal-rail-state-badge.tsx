import { PoRepDealRailState } from "@/lib/cdp";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import { type ClassValue } from "class-variance-authority/types";
import { type HTMLAttributes } from "react";

type RailStateClassMap = Record<PoRepDealRailState, ClassValue>;

export interface DealRailStateBadgeProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  state: PoRepDealRailState;
}

const badgeClasses = cva(
  "pl-2 pr-3 py-1 border rounded-full inline-flex items-center gap-2 uppercase font-semibold",
  {
    variants: {
      state: {
        [PoRepDealRailState.FINALIZED]: "bg-gray-400/40 text-gray-500",
        [PoRepDealRailState.IDLE]: "bg-yellow-500/40 text-yellow-600",
        [PoRepDealRailState.ACTIVE]: "bg-green-500/40 text-green-600",
        [PoRepDealRailState.TERMINATED]: "bg-red-500/40 text-red-600",
      } satisfies RailStateClassMap,
    },
  }
);

const dotClasess = cva("h-2 w-2 rounded-full", {
  variants: {
    state: {
      [PoRepDealRailState.FINALIZED]: "bg-gray-400",
      [PoRepDealRailState.IDLE]: "bg-yellow-500",
      [PoRepDealRailState.ACTIVE]: "bg-green-500",
      [PoRepDealRailState.TERMINATED]: "bg-red-500",
    } satisfies RailStateClassMap,
  },
});

const stateLabelDict: Record<PoRepDealRailState, string> = {
  [PoRepDealRailState.FINALIZED]: "Finalized",
  [PoRepDealRailState.IDLE]: "Idle",
  [PoRepDealRailState.ACTIVE]: "Active",
  [PoRepDealRailState.TERMINATED]: "Terminated",
};

export function DealRailStateBadge({
  className,
  state,
  ...rest
}: DealRailStateBadgeProps) {
  return (
    <div {...rest} className={cn(badgeClasses({ state }), className)}>
      <div className={dotClasess({ state })} />
      <p className="text-xs leading-none mt-0.5">{stateLabelDict[state]}</p>
    </div>
  );
}
