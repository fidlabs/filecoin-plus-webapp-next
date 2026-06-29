import { Card } from "@/components/ui/card";
import { PoRepProviderSLIPerformanceStatisticsGrid } from "./po-rep-provider-sli-performance-statistics-grid";
import { F0IdInput } from "@/lib/f0-id";
import { ProviderDealsComplianceTable } from "./provider-deals-compliance-table";
import { SLIComplianceHistoryChart } from "@/app/po-rep/components/sli-compliance-history-chart";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SliComplianceExplanationText } from "@/app/po-rep/components/sli-compliance-explanation-text";

export interface PoRepProviderPerformanceWidgetProps {
  providerId: F0IdInput;
}

export function PoRepProviderSLIPerformanceWidget({
  providerId,
}: PoRepProviderPerformanceWidgetProps) {
  return (
    <Card className="pt-6">
      <header className="mb-6 px-4">
        <h3 className="text-lg font-semibold">SLI Performance</h3>
        <p className="text-sm text-muted-foreground">
          Provider&apos;s SLI performance breakdown
        </p>
      </header>

      <section className="mb-6 px-4">
        <h4 className="text-sm font-semibold mb-2 uppercase">Deals</h4>
        <PoRepProviderSLIPerformanceStatisticsGrid providerId={providerId} />
      </section>

      <section className="px-4">
        <h4 className="text-sm font-semibold mb-2 uppercase">
          Performance History
        </h4>
        <SLIComplianceHistoryChart providerId={providerId} />
      </section>

      <ProviderDealsComplianceTable providerId={providerId} />

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
