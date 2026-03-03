import { cn } from "@/lib/utils";
import { type AccordionSingleProps } from "@radix-ui/react-accordion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

export type RetrievabilityChartExplanationProps = Omit<
  AccordionSingleProps,
  "children" | "type"
>;

export function RetrievabilityChartExplanation({
  className,
  ...rest
}: RetrievabilityChartExplanationProps) {
  return (
    <Accordion
      {...rest}
      type="single"
      collapsible
      className={cn("mt-6 border-t", className)}
    >
      <AccordionItem className="border-b-0" value="data-disclaimer">
        <AccordionTrigger className="px-4 text-sm">
          About different retrievability types
        </AccordionTrigger>
        <AccordionContent className="px-4 text-justify">
          <ul className="list-disc [&>li]:mb-1.5 pl-4">
            <li>RPA - default Random Piece Availability</li>
            <li>
              Consistent - retrievability of Storage Providers including CAR
              files only
            </li>
            <li>
              Inconsistent - retrievability of Storage Providers excluding the
              CAR files / including other available files that are not CAR files
            </li>
          </ul>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
