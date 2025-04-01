import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

type DivProps = HTMLAttributes<HTMLDivElement>;

const PageTitle = ({ children, className, ...rest }: DivProps) => {
  return (
    <div
      {...rest}
      className={cn("h-[90px] flex flex-col items-end justify-end", className)}
    >
      <h1 className="text-3xl leading-relaxed font-semibold text-white">
        {children}
      </h1>
    </div>
  );
};

const PageHeader = ({ children, className, ...rest }: DivProps) => {
  return (
    <div
      {...rest}
      className={cn("flex flex-col items-start h-[140px]", className)}
    >
      {children}
    </div>
  );
};

const PageSubTitle = ({ children, className, ...rest }: DivProps) => {
  return (
    <div
      {...rest}
      className={cn("h-[50px] flex flex-col items-end", className)}
    >
      <h1 className="text-sm leading-none text-white">{children}</h1>
    </div>
  );
};

export { PageTitle, PageHeader, PageSubTitle };
