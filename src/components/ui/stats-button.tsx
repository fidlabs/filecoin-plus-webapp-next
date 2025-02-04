import {PropsWithChildren} from "react";
import {cn} from "@/lib/utils";
import {Button, ButtonProps} from "@/components/ui/button";
import {ChevronRight} from "lucide-react";

type StatsButtonProps = PropsWithChildren<ButtonProps & {
  simple?: boolean
}>

const StatsButton = ({children, className, simple, ...props}: StatsButtonProps) => {
  return <Button variant={simple ? "linkSimple" : "link"} className={cn("group !pr-[20px]", className)} {...props}>
    {children}
    <ChevronRight size={16}
                  className="absolute right-[3px] transition-all group-hover:right-0"/>
  </Button>
}

export {StatsButton};