"use client";
import {GenericContentHeader} from "@/components/generic-content-view";
import {ComplianceDownloadButton} from "@/components/compliance-button";
import {ClientsNavigation} from "@/app/clients/(pages)/[id]/components/clients-navigation";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {LoaderCircle} from "lucide-react";
import {useClientDetails} from "@/app/clients/(pages)/[id]/components/client.provider";
import {useEffect} from "react";
import {AllocationsListTable} from "@/app/clients/(pages)/[id]/(pages)/allocations/components/allocations-list-table";
import {AllocatorsListTable} from "@/app/clients/(pages)/[id]/(pages)/allocations/components/allocators-list-table";
import {AllocationsChart} from "@/app/clients/(pages)/[id]/(pages)/allocations/components/allocations-chart";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";

interface IPageProps {
  params: { id: string }
}

const ClientAllocationsPage = (pageParams: IPageProps) => {

  const clientId = pageParams.params.id

  const {allocationsData, getAllocationsData, data, loading} = useClientDetails()

  useEffect(() => {
    getAllocationsData()
  }, [getAllocationsData])

  return <>
    <Card>
      <GenericContentHeader placeholder="Storage Provider ID"
                            sticky
                            fixedHeight={false}
                            addons={<ComplianceDownloadButton id={clientId}/>}>
        <div className="flex flex-row gap-6 items-baseline">
          <ClientsNavigation selected={'allocations'} clientId={clientId} loading={loading} data={data}/>
        </div>
      </GenericContentHeader>
      <CardContent className="p-0">
        {
          loading && !allocationsData && <div className="p-10 w-full flex flex-col items-center justify-center">
            <LoaderCircle className="animate-spin"/>
          </div>
        }
        {
          !loading && allocationsData && <div>
            <Tabs defaultValue="table">
              <TabsList className="mx-4 my-2">
                <TabsTrigger value="table">Allocations table</TabsTrigger>
                <TabsTrigger value="chart">Allocations chart</TabsTrigger>
              </TabsList>
              <TabsContent value="table">
                <AllocationsListTable/>
              </TabsContent>
              <TabsContent value="chart">
                <AllocationsChart/>
              </TabsContent>
            </Tabs>
          </div>
        }
      </CardContent>
    </Card>
    <Card className="mt-4">
      <CardHeader className="sticky top-0 bg-white z-10 rounded-t-lg">
        <CardTitle className="text-xl">Allocators</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {
          loading && !allocationsData && <div className="p-10 w-full flex flex-col items-center justify-center">
            <LoaderCircle className="animate-spin"/>
          </div>
        }
        {
          !loading && allocationsData && <div>
            <AllocatorsListTable/>
          </div>
        }
      </CardContent>
    </Card>
  </>
}

export default ClientAllocationsPage