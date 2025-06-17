"use client";
import { ClientProvidersProvider } from "@/app/clients/(pages)/[id]/(pages)/providers/components/client-providers.provider";
import { ProvidersChart } from "@/app/clients/(pages)/[id]/(pages)/providers/components/providers-chart";
import { ProvidersTable } from "@/app/clients/(pages)/[id]/(pages)/providers/components/providers.table";
import { ClientOnlyWrapper } from "@/components/client-only-wrapper";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CardContent } from "@/components/ui/card";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ClientProvidersResponse } from "@/lib/api";
import { useMediaQuery } from "usehooks-ts";

interface IPageProps {
  data: ClientProvidersResponse;
}

const ProvidersList = ({ data }: IPageProps) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <ClientProvidersProvider initialData={data}>
      <CardContent className="p-0">
        {isDesktop && (
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={65}>
              <ProvidersChart />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel>
              <ProvidersTable />
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
        {!isDesktop && (
          <Accordion
            defaultValue={"table"}
            className="p-4"
            type="single"
            collapsible
          >
            <AccordionItem value="charts">
              <AccordionTrigger>Charts</AccordionTrigger>
              <AccordionContent>
                <ClientOnlyWrapper>
                  <ProvidersChart />
                </ClientOnlyWrapper>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="table">
              <AccordionTrigger>Table</AccordionTrigger>
              <AccordionContent>
                <ProvidersTable />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </CardContent>
    </ClientProvidersProvider>
  );
};

export { ProvidersList };
