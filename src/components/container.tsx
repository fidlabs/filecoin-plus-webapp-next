import { cn } from "@/lib/utils";
import { forwardRef, type HTMLAttributes } from "react";

export type ContainerProps = HTMLAttributes<HTMLDivElement>;

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ children, className, ...rest }, ref) => {
    return (
      <div
        {...rest}
        className={cn("w-full max-w-[1700px] mx-auto px-4 md:px-12", className)}
        ref={ref}
      >
        {children}
      </div>
    );
  }
);
