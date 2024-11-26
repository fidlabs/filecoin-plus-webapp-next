import {AnchorHTMLAttributes, PropsWithChildren} from "react";
import Link, {LinkProps} from "next/link";
import {cn} from "@/lib/utils";
import {buttonVariants} from "@/components/ui/button";
import {ChevronRight} from "lucide-react";

type StatsLinkProps = PropsWithChildren<LinkProps & AnchorHTMLAttributes<HTMLAnchorElement> & {
  simple?: boolean
}>

const StatsLink = ({href, children, simple, ...props}: StatsLinkProps) => {
  return <Link href={href} className={cn(buttonVariants({variant: simple ? "linkSimple" : "link"}), "group !pr-[20px]")} {...props}>
    {children}
    <ChevronRight size={16}
                  className="absolute right-[3px] transition-all group-hover:right-0"/>
  </Link>
}

export {StatsLink};