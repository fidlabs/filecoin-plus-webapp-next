"use client"
import {GenericContentHeader} from "@/components/generic-content-view";
import {JsonLd} from "@/components/json.ld";
import {Card} from "@/components/ui/card";
import {Organization, WithContext} from "schema-dts";
import {allocatorsTabs} from "../../constants";
import {useDataCapFlow} from "@/lib/hooks/dmob.hooks";
import {LoaderCircle} from "lucide-react";
import {DataCapFlowTree} from "@/app/allocators/(pages)/audit-tree/components/datacap-flow-tree";

function AllocatorsDatacapFlowPage() {
  const {dataCapFlow, loading, loaded} = useDataCapFlow()

  const jsonLdData: WithContext<Organization> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Fil+ Allocators Audit Flow",
    image: "https://cryptologos.cc/logos/filecoin-fil-logo.png?v=040",
    description: "View allocators audits of Fil+ program",
  };

  return (
    <JsonLd data={jsonLdData}>
      <main className="main-content">
        <Card className="mt-[50px]">
          <GenericContentHeader
            selected={allocatorsTabs[3].value}
            navigation={allocatorsTabs}
          />
          {loading && <div className="p-10 w-full flex flex-col items-center justify-center">
            <LoaderCircle className="animate-spin"/>
          </div>}
          {!loading && loaded && <DataCapFlowTree data={dataCapFlow}/>}
        </Card>
      </main>
    </JsonLd>
  );
}

export default AllocatorsDatacapFlowPage;
