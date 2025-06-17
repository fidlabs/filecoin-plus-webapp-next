import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button, ButtonProps } from "./ui/button";

export type FilecoinPulseButtonProps = Omit<ButtonProps, "asChild"> & {
  url: string;
};

export function FilecoinPulseButton({
  children,
  className,
  url,
  ...rest
}: FilecoinPulseButtonProps) {
  return (
    <Button
      variant="outline"
      {...rest}
      asChild
      className={cn(
        "bg-transparent rounded-full w-full max-w-80 text-white gap-2 hover:text-dodger-blue",
        className
      )}
    >
      <Link href={url} target="_blank">
        {children}
        <svg
          className="w-6 h-6 "
          viewBox="0 0 48 48"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="48" height="48" fill="none" />
          <path
            fill="currentColor"
            d="M29,42a1.9,1.9,0,0,1-1.9-1.4L20.9,21.9l-5,12.8A1.9,1.9,0,0,1,14.1,36a2.1,2.1,0,0,1-1.9-1.1L8.6,27.6,5.5,31.3a2,2,0,0,1-2.8.2,2,2,0,0,1-.2-2.8l5-6A1.9,1.9,0,0,1,9.2,22a2.1,2.1,0,0,1,1.6,1.1l3,6,5.3-13.8a2,2,0,0,1,3.8.1L28.8,33,36.1,5.5A1.9,1.9,0,0,1,37.9,4a2,2,0,0,1,2,1.4l6,18a2,2,0,0,1-3.8,1.2L38.2,13,30.9,40.5A1.9,1.9,0,0,1,29.1,42Z"
          />
        </svg>
      </Link>
    </Button>
  );
}
