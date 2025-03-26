"use client";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {DCFlowSankey} from "@/app/(dashboard)/components/dc-flow-sankey";
import {IGoogleSheetResponse} from "@/lib/interfaces/cdp/google.interface";
import {IAllocatorsResponse} from "@/lib/interfaces/dmob/allocator.interface";

interface IDatacapFlow {
  sheetData: IGoogleSheetResponse,
  allocatorsData: IAllocatorsResponse
}

const DatacapFlow = ({sheetData, allocatorsData}: IDatacapFlow) => {
  return <Card id="flowCharts"
               className="hidden w-full overflow-hidden h-auto lg:block mb-28">
    <CardHeader>
      <CardTitle>Datacap Flow</CardTitle>
    </CardHeader>
    <CardContent className="px-0 min-h-[900px]">
      <DCFlowSankey sheetData={sheetData} allocatorsData={allocatorsData}/>
    </CardContent>
  </Card>
}

export {DatacapFlow}