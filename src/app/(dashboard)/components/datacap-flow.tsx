"use client";
import {useDataCapFlow} from "@/lib/hooks/dmob.hooks";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {DataCapFlowTree} from "@/app/(dashboard)/components/datacap-flow-tree";
import {DataCapFlowSankey} from "@/app/(dashboard)/components/datacap-flow-sankey";
import {useState} from "react";

const DatacapFlow = () => {
  const {data} = useDataCapFlow()

  const [tab, setTab] = useState('tree')

  return <Card id="flowCharts"
               className="hidden w-full overflow-hidden h-auto lg:block">
    <CardHeader>
      <CardTitle>Datacap Flow</CardTitle>
    </CardHeader>
    <CardContent className="min-h-[1000px] px-0 max-h-[1000px]">
      <Tabs value={tab} className="w-full" onValueChange={setTab}>
        <div className="flex items-center px-6 pb-4 border-b">
          <TabsList>
            <TabsTrigger value="tree">Allocators tree</TabsTrigger>
            <TabsTrigger value="flow">DataCap flow</TabsTrigger>
          </TabsList>
          <div className="ml-2">
            {
              tab === 'tree' ? <p></p> : <p className="text-sm text-muted-foreground max-w-[70ch]">
                Distribution of DataCap from Root Key Holder to Clients with different deal sizes. Click on the chart
                for more details.
              </p>
            }
          </div>
        </div>
        <TabsContent value="tree">
          <DataCapFlowTree data={data}/>
        </TabsContent>
        <TabsContent value="flow">
          <DataCapFlowSankey data={data}/>
        </TabsContent>
      </Tabs>
    </CardContent>
  </Card>

}

export {DatacapFlow}