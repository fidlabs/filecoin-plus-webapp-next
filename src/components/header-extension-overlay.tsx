import { cn } from "@/lib/utils";
import { forwardRef, HTMLAttributes } from "react";

export type HeaderExtensionOverlayProps = HTMLAttributes<HTMLDivElement>;

export const HeaderExtensionOverlay = forwardRef<
  HTMLDivElement,
  HeaderExtensionOverlayProps
>(({ className, children, ...rest }, ref) => {
  return (
    <div
      {...rest}
      className={cn(
        "relative pt-8 before:absolute before:bg-header before:top-0 before:inset-x-0 before:h-[82px]",
        className
      )}
      ref={ref}
    >
      <div className="relative z-10">{children}</div>
    </div>
  );
});

HeaderExtensionOverlay.displayName = "HeaderExtensionOverlay";
