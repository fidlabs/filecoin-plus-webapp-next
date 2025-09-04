import { GenericContentHeader } from "@/components/generic-content-view";
import { JsonLd } from "@/components/json.ld";
import { Card } from "@/components/ui/card";
import { Organization, WithContext } from "schema-dts";
import { allocatorsTabs } from "../../constants";
import { AuditsFlowSankey } from "./components/audits-flow-sankey";
import { fetchAllocatorsAuditStates } from "@/lib/api";
import { EditionRoundSelect } from "@/app/compliance-data-portal/components/edition-round-select";

export const revalidate = 300;

interface PageProps {
  searchParams: Record<string, string | undefined>;
}

const jsonLdData: WithContext<Organization> = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Fil+ Allocators Audit Flow",
  image: "https://cryptologos.cc/logos/filecoin-fil-logo.png?v=040",
  description: "View allocators audits of Fil+ program",
};

export default async function AllocatorsAuditsFlowPage({
  searchParams,
}: PageProps) {
  const data = await fetchAllocatorsAuditStates({
    editionId: searchParams.editionId,
  });

  return (
    <JsonLd data={jsonLdData}>
      <main className="main-content">
        <Card className="mt-[50px]">
          <GenericContentHeader
            selected={allocatorsTabs[2].value}
            navigation={allocatorsTabs}
            addons={<EditionRoundSelect label="Edition:" />}
          />
          <AuditsFlowSankey data={data} />
        </Card>
      </main>
    </JsonLd>
  );
}
