import { cn } from "@/lib/utils";
import { type HTMLAttributes } from "react";

type Variant = "active" | "paused" | "blocked";

export interface ProviderStatusBadgeProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  variant: Variant;
}

const variantLabelDict: Record<Variant, string> = {
  active: "Active",
  paused: "Paused",
  blocked: "Blocked",
};

export function ProviderStatusBadge({
  className,
  variant,
  ...rest
}: ProviderStatusBadgeProps) {
  return (
    <div
      {...rest}
      className={cn(
        "pl-2 pr-3 py-1 border rounded-full bg-green-600/30 border-green-600 flex items-center gap-2",
        variant === "paused" && "bg-yellow-500/40 border-yellow-500",
        variant === "blocked" && "bg-red-500/40 border-red-500",
        className
      )}
    >
      <div
        className={cn(
          "h-2 w-2 rounded-full bg-green-600",
          variant === "paused" && "bg-yellow-500",
          variant === "blocked" && "bg-red-500"
        )}
      />
      <p className="text-xs leading-none mt-0.5">{variantLabelDict[variant]}</p>
    </div>
  );
}
