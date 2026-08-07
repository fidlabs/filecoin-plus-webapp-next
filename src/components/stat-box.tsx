import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { type ReactNode } from "react";
import { Skeleton } from "./ui/skeleton";

export type StatBoxProps = {
  label: string;
  value: ReactNode;
} & VariantProps<typeof variants>;

const variants = cva("py-4 px-6 bg-gray-100/50 rounded-md", {
  variants: {
    variant: {
      success: "text-green-500",
      warning: "text-yellow-500",
      error: "text-red-500",
      default: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export function StatBox({ label, value, variant = "default" }: StatBoxProps) {
  return (
    <div className={cn(variants({ variant }))}>
      <p className="text-xs text-muted-foreground mb-2">{label}</p>
      {value !== null ? (
        <p className="text-2xl font-semibold">{value}</p>
      ) : (
        <Skeleton className="h-8 w-[100px]" />
      )}
    </div>
  );
}
