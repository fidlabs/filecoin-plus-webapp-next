import { cn } from "@/lib/utils";

type GridColumnConfig = "col-1" | "col-2";

type CardGridProps = {
  cols: GridColumnConfig;
  hasGridAutoRows?: boolean;
  children: React.ReactNode;
};

const baseGridStyles = "grid gap-6 h-full";
const extendedGridStyles: Record<GridColumnConfig, string> = {
  "col-1": "grid-cols-1",
  "col-2": "grid-cols-2",
};

const CardGrid = ({ cols, children }: CardGridProps) => {
  return (
    <div className={cn(baseGridStyles, extendedGridStyles[cols])}>
      {children}
    </div>
  );
};

export { CardGrid };
