import {EqualIcon, TrendingDownIcon, TrendingUpIcon} from "lucide-react";
import {CompareType} from "@/lib/interfaces/cdp/cdp.interface";

const CompareIcon = ({compare}: {compare: CompareType}) => {
  return (
    <div>
      {compare === 'equal' && <EqualIcon size={15} className="text-muted-foreground"/>}
      {compare === 'up' && <TrendingUpIcon size={15}  className="text-green-600"/>}
      {compare === 'down' && <TrendingDownIcon size={15}  className="text-red-600"/>}
    </div>
  )
}

export {CompareIcon}