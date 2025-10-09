import { cn } from "@/lib/utils";
import { type HTMLAttributes } from "react";

export type ContainerProps = HTMLAttributes<HTMLDivElement>;

export function Container({ children, className, ...rest }: ContainerProps) {
  return (
    <div
      {...rest}
      className={cn("w-full max-w-[1700px] mx-auto px-4 md:px-12", className)}
    >
      {children}
    </div>
  );
}
