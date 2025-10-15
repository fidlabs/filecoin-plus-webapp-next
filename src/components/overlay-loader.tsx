import { cn } from "@/lib/utils";
import { LoaderCircleIcon } from "lucide-react";
import { type HTMLAttributes } from "react";

export interface OverlayLoaderProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  show?: boolean;
}

export function OverlayLoader({
  className,
  show = false,
  ...rest
}: OverlayLoaderProps) {
  return (
    <div
      {...rest}
      className={cn(
        "absolute top-0 left-0 w-full h-full items-center justify-center bg-black/10 hidden",
        show && "flex",
        className
      )}
    >
      <LoaderCircleIcon size={50} className="animate-spin text-dodger-blue" />
    </div>
  );
}
