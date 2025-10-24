"use client";

import { HTMLAttributes, useCallback, useEffect, useState } from "react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { useDebounceCallback } from "usehooks-ts";
import { ChevronUpIcon } from "lucide-react";

export interface BackToTopProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  activationThresholdPx?: number;
}

export function BackToTop({
  activationThresholdPx = 200,
  className,
  ...rest
}: BackToTopProps) {
  const [active, setActive] = useState(false);
  const handleButtonClick = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleScroll = useCallback(() => {
    setActive(window.scrollY >= activationThresholdPx);
  }, [activationThresholdPx]);
  const handleScrollDebounced = useDebounceCallback(handleScroll, 50, {
    maxWait: 100,
  });

  useEffect(() => {
    window.addEventListener("scroll", handleScrollDebounced);

    return () => {
      window.removeEventListener("scroll", handleScrollDebounced);
    };
  }, [handleScrollDebounced]);

  return (
    <div {...rest} className={cn("h-14", className)}>
      <Button
        className={cn(
          "fixed right-4 bottom-4 rounded-full shadow-md opacity-0 transition-opacity",
          active && "opacity-100"
        )}
        onClick={handleButtonClick}
      >
        Back to Top
        <ChevronUpIcon className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
}
