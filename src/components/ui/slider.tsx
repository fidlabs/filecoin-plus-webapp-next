"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

interface SliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  popoverPlacement?: "top" | "bottom";
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, popoverPlacement, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center h-5",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
      <SliderPrimitive.Range className="absolute h-full bg-dodger-blue" />
    </SliderPrimitive.Track>
    {props.value?.map((_, i) => (
      <SliderPrimitive.Thumb
        key={i}
        data-popover={`€${props.value?.[i]}`}
        className={cn(
          "block relative h-5 w-5 rounded-full border-2 border-dodger-blue bg-background ring-offset-background transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
          {
            "before:content-[attr(data-popover)] before:absolute before:bottom-6 before:-translate-x-[25%]":
              popoverPlacement === "top",
          },
          {
            "before:content-[attr(data-popover)] before:absolute before:top-6 before:-translate-x-[25%]":
              popoverPlacement === "bottom",
          }
        )}
      />
    ))}
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
