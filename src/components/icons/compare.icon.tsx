import { EqualIcon, TrendingDownIcon, TrendingUpIcon } from "lucide-react";
import { CompareType } from "@/lib/interfaces/cdp/cdp.interface";
import { HTMLAttributes } from "react";

export interface CompareIconProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  compare: CompareType;
  increaseNegative?: boolean;
}

export function CompareIcon({
  compare,
  increaseNegative = false,
  ...rest
}: CompareIconProps) {
  if (!compare) {
    return null;
  }

  return (
    <div {...rest}>
      {compare === "equal" && (
        <EqualIcon size={15} className="text-muted-foreground" />
      )}
      {compare === "up" && (
        <TrendingUpIcon
          size={15}
          className={increaseNegative ? "text-red-600" : "text-green-600"}
        />
      )}
      {compare === "down" && (
        <TrendingDownIcon
          size={15}
          className={increaseNegative ? "text-green-600" : "text-red-600"}
        />
      )}
    </div>
  );
}
