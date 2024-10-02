"use client";
import {useClientDetails} from "@/app/clients/(pages)/[id]/components/client.provider";
import {Card, CardContent} from "@/components/ui/card";
import {GenericContentHeader} from "@/components/generic-content-view";
import {ComplianceDownloadButton} from "@/components/compliance-button";
import {ClientsNavigation} from "@/app/clients/(pages)/[id]/components/clients-navigation";
import {LoaderCircle} from "lucide-react";
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "@/components/ui/resizable";
import {ProvidersChart} from "@/app/clients/(pages)/[id]/(pages)/providers/components/providers-chart";
import {useEffect} from "react";
import {ProvidersTable} from "@/app/clients/(pages)/[id]/(pages)/providers/components/providers.table";
import {useMediaQuery} from "usehooks-ts";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";

interface IPageProps {
  params: { id: string }
}

const ClientProviderBreakdownPage = (pageParams: IPageProps) => {
  const clientId = pageParams.params.id

  const {providersData, getProvidersData, data, loading} = useClientDetails()

  useEffect(() => {
    getProvidersData()
  }, [getProvidersData])

  const isDesktop = useMediaQuery('(min-width: 768px)');

  return <Card>
    <GenericContentHeader placeholder="Storage Provider ID"
                          sticky
                          fixedHeight={false}
                          addons={<ComplianceDownloadButton id={clientId}/>}>
      <div className="flex flex-row w-full gap-6 items-baseline">
        <ClientsNavigation selected={'providers'} clientId={clientId} loading={loading} data={data}/>
      </div>
    </GenericContentHeader>
    <CardContent className="p-0">
      {
        loading && !providersData && <div className="p-10 w-full flex flex-col items-center justify-center">
          <LoaderCircle className="animate-spin"/>
        </div>
      }
      {
        providersData && isDesktop && <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={65}>
              <ProvidersChart/>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel>
              <ProvidersTable/>
            </ResizablePanel>
          </ResizablePanelGroup>
      }
      {
        providersData && !isDesktop && <Accordion defaultValue={'table'} className="p-4" type="single" collapsible>
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
  </Card>

}

export default ClientProviderBreakdownPage