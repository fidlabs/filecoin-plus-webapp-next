import { DCFlowSankey } from "@/components/dc-flow-sankey";
import { GenericContentHeader } from "@/components/generic-content-view";
import { JsonLd } from "@/components/json.ld";
import { Card } from "@/components/ui/card";
import { generatePageMetadata } from "@/lib/utils";
import { Metadata } from "next";
import { Organization, WithContext } from "schema-dts";
import { allocatorsTabs } from "../../constants";

export const metadata: Metadata = generatePageMetadata({
  title: "Fil+ DataCap Stats | Datacap Flow",
  description: "Fil+ DataCap Stats | Datacap Flow",
  url: "https://datacapstats.io/allocators/datacap-flow",
});

export default async function DatacapFlowPage() {
  const jsonLdData: WithContext<Organization> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Fil+ Datacap Flow",
    image: "https://cryptologos.cc/logos/filecoin-fil-logo.png?v=040",
    description: "View allocators datacap flow of Fil+ program",
  };

  return (
    <JsonLd data={jsonLdData}>
      <main className="main-content">
        <Card className="mt-[50px]">
          <GenericContentHeader
            selected={allocatorsTabs[1].value}
            navigation={allocatorsTabs}
          />

          <DCFlowSankey />
        </Card>
      </main>
    </JsonLd>
  );
}
