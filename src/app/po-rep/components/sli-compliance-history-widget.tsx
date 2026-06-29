"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { type ComponentProps } from "react";
import { type FetchSLIComplianceHistoryParameters } from "../po-rep-data";
import { SLIComplianceHistoryChart } from "./sli-compliance-history-chart";
import { SliComplianceExplanationText } from "./sli-compliance-explanation-text";

type CardProps = ComponentProps<typeof Card>;

interface SLIComplianceHistoryWidgetProps
  extends Omit<CardProps, "children">,
    Pick<FetchSLIComplianceHistoryParameters, "providerId"> {}

export function SLIComplianceHistoryWidget({
  className,
  ...rest
}: SLIComplianceHistoryWidgetProps) {
  return (
    <Card {...rest} className={cn("pb-2", className)}>
      <header className="px-4 py-4 max-w-[min(50vw, 200px)]">
        <h3 className="text-lg font-medium">SLI Performance</h3>
        <p className="text-xs text-muted-foreground">
          Overview of Providers performance in fulfilling deals requirements.
        </p>
      </header>

      <div className="px-4">
        <SLIComplianceHistoryChart />
      </div>

      <Accordion type="single" collapsible className="mt-6 border-t">
        <AccordionItem className="border-b-0" value="states">
          <AccordionTrigger className="px-4 text-sm">
            What do different states mean?
          </AccordionTrigger>
          <AccordionContent className="px-4 text-justify">
            <SliComplianceExplanationText />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}
