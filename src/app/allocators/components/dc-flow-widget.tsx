import { DCFlowSankey } from "@/components/dc-flow-sankey";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { type ComponentProps } from "react";

type CardProps = ComponentProps<typeof Card>;
export type DCFlowWidgetProps = Omit<CardProps, "children">;

export function DCFlowWidget({ className, ...rest }: DCFlowWidgetProps) {
  return (
    <Card {...rest} className={cn("pb-6", className)}>
      <div className="px-4 pt-6 mb-2 gap-4">
        <h2 className="text-lg font-medium">Datacap Flow</h2>
        <p className="text-xs text-muted-foreground">
          Graph showing how much Datcap runs through different distribution
          pathways.
        </p>
      </div>
      <DCFlowSankey />
    </Card>
  );
}
