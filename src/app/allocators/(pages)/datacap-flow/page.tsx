import { GenericContentHeader } from "@/components/generic-content-view";
import { JsonLd } from "@/components/json.ld";
import { Card } from "@/components/ui/card";
import { generatePageMetadata } from "@/lib/utils";
import { Metadata } from "next";
import { Organization, WithContext } from "schema-dts";
import { allocatorsTabs } from "../../constants";
import { getAllocators, getGoogleSheetAuditSizes } from "@/lib/api";
import { DCFlowSankey } from "@/components/dc-flow-sankey";

export const metadata: Metadata = generatePageMetadata({
  title: "Fil+ DataCap Stats | Datacap Flow",
  description: "Fil+ DataCap Stats | Datacap Flow",
  url: "https://datacapstats.io/allocators/datacap-flow",
});

async function fetchPageData() {
  const [allocatorsData, sheetData] = await Promise.all([
    getAllocators({
      page: "1",
      limit: "999999",
      showInactive: "true",
    }),
    getGoogleSheetAuditSizes(),
  ]);

  return {
    allocatorsData,
    sheetData,
  };
}

export default async function DatacapFlowPage() {
  const { allocatorsData, sheetData } = await fetchPageData();
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

          <DCFlowSankey allocatorsData={allocatorsData} sheetData={sheetData} />
        </Card>
      </main>
    </JsonLd>
  );
}
