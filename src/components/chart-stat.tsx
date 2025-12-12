import { cn } from "@/lib/utils";
import { ReactNode, type HTMLAttributes } from "react";
import { Skeleton } from "./ui/skeleton";

type BaseProps = Omit<HTMLAttributes<HTMLDivElement>, "children">;
export interface ChartStatProps extends BaseProps {
  label: ReactNode;
  percentageChange?: number;
  placeholderWidth?: number;
  value: ReactNode;
}

const changeFormatter = new Intl.NumberFormat("en-US", {
  signDisplay: "always",
  style: "percent",
  maximumFractionDigits: 2,
});

export function ChartStat({
  label,
  percentageChange,
  placeholderWidth = 100,
  value,
  ...rest
}: ChartStatProps) {
  const changeText =
    typeof percentageChange !== "undefined"
      ? changeFormatter.format(percentageChange)
      : null;

  return (
    <div {...rest}>
      {typeof value !== "undefined" && value !== null ? (
        <p className="text-2xl font-medium">
          {value}
          {changeText !== null && (
            <span
              className={cn(
                "font-light text-muted-foreground",
                typeof percentageChange !== "undefined" &&
                  percentageChange > 0 &&
                  "text-green-500",
                typeof percentageChange !== "undefined" &&
                  percentageChange < 0 &&
                  "text-red-500"
              )}
            >
              {" "}
              ({changeText})
            </span>
          )}
        </p>
      ) : (
        <div className="py-1">
          <Skeleton className={`h-6 w-[${placeholderWidth}px]`} />
        </div>
      )}

      <p className="text-xs font-medium text-muted-foreground">{label}</p>
    </div>
  );
}
