"use client";
import {GenericContentHeader} from "@/components/generic-content-view";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {LoaderCircle} from "lucide-react";
import {useClientDetails} from "@/app/clients/(pages)/[id]/components/client.provider";
import {useEffect} from "react";
import {AllocationsListTable} from "@/app/clients/(pages)/[id]/(pages)/allocations/components/allocations-list-table";
import {AllocatorsListTable} from "@/app/clients/(pages)/[id]/(pages)/allocations/components/allocators-list-table";
import {AllocationsChart} from "@/app/clients/(pages)/[id]/(pages)/allocations/components/allocations-chart";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";

const ClientAllocationsPage = () => {
  const {allocationsData, tabs, getAllocationsData, loading} = useClientDetails()

  useEffect(() => {
    getAllocationsData()
  }, [getAllocationsData])

  return <div className="main-content">
    <Card>
      <GenericContentHeader placeholder="Storage Provider ID"
                            sticky
                            navigation={tabs}
                            selected="allocations"
                            fixedHeight={false}
                            />
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
  </div>
}

export default ClientAllocationsPage