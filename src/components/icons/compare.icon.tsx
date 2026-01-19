import { EqualIcon, TrendingDownIcon, TrendingUpIcon } from "lucide-react";
import { CompareType } from "@/lib/interfaces/cdp/cdp.interface";

export function CompareIcon({ compare }: { compare: CompareType }) {
  if (!compare) {
    return null;
  }

  return (
    <div>
      {compare === "equal" && (
        <EqualIcon size={15} className="text-muted-foreground" />
      )}
      {compare === "up" && (
        <TrendingUpIcon size={15} className="text-green-600" />
      )}
      {compare === "down" && (
        <TrendingDownIcon size={15} className="text-red-600" />
      )}
    </div>
  );
}
