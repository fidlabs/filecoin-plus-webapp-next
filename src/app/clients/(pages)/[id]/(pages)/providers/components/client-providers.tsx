"use client"
import {CardContent} from "@/components/ui/card";
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "@/components/ui/resizable";
import {ProvidersChart} from "@/app/clients/(pages)/[id]/(pages)/providers/components/providers-chart";
import {ProvidersTable} from "@/app/clients/(pages)/[id]/(pages)/providers/components/providers.table";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";
import {IClientProviderBreakdownResponse} from "@/lib/interfaces/dmob/client.interface";
import {useMediaQuery} from "usehooks-ts";
import {
  ClientProvidersProvider
} from "@/app/clients/(pages)/[id]/(pages)/providers/components/client-providers.provider";

interface IPageProps {
  data: IClientProviderBreakdownResponse
}

const ProvidersList = ({data}: IPageProps) => {

  const isDesktop = useMediaQuery('(min-width: 768px)');

  return <ClientProvidersProvider initialData={data}>
      <CardContent className="p-0">
        {
          isDesktop && <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={65}>
              <ProvidersChart/>
            </ResizablePanel>
            <ResizableHandle/>
            <ResizablePanel>
              <ProvidersTable/>
            </ResizablePanel>
          </ResizablePanelGroup>
        }
        {
          !isDesktop && <Accordion defaultValue={'table'} className="p-4" type="single" collapsible>
            <AccordionItem value="charts">
              <AccordionTrigger>Charts</AccordionTrigger>
              <AccordionContent>
                <ProvidersChart/>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="table">
              <AccordionTrigger>Table</AccordionTrigger>
              <AccordionContent>
                <ProvidersTable/>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        }
      </CardContent>
    </ClientProvidersProvider>
}

export {ProvidersList}