import { Charts } from "@/app/(dashboard)/components/charts";
import { DatacapFlow } from "@/app/(dashboard)/components/datacap-flow";
import { Stats } from "@/app/(dashboard)/components/stats";
import { Container } from "@/components/container";
import { JsonLd } from "@/components/json.ld";
import { PageHeader, PageSubtitle, PageTitle } from "@/components/page-header";
import {
  getAllocators,
  getDataCapAllocationsWeekly,
  getDataCapAllocationsWeeklyByClient,
  getStats,
} from "@/lib/api";
import { WebPage, WithContext } from "schema-dts";

export const revalidate = 300;

const page: WithContext<WebPage> = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Fil+ DataCap Stats",
  image: "https://cryptologos.cc/logos/filecoin-fil-logo.png?v=040",
  description:
    "Your entry place into statistics and metrics about the Filecoin Plus program.",
};

export default async function Home() {
  const [stats, allocationWeekly, allocationWeeklyByClient, allocators] =
    await Promise.all([
      getStats(),
      getDataCapAllocationsWeekly(),
      getDataCapAllocationsWeeklyByClient(),
      getAllocators({
        page: "1",
        limit: "999999",
        showInactive: "true",
      }),
    ]);

  return (
    <JsonLd data={page}>
      <main className="flex flex-col gap-8">
        <PageHeader>
          <PageTitle>State of Fil+</PageTitle>
          <PageSubtitle>
            Quick statistics and metrics about the Filecoin Plus program.
          </PageSubtitle>
        </PageHeader>
        <Container className="flex flex-col gap-6 w-full">
          <Stats />
          <Charts
            stats={stats}
            allocationWeekly={allocationWeekly}
            allocationWeeklyByClient={allocationWeeklyByClient}
            allocators={allocators}
          />
          <DatacapFlow />
        </Container>
      </main>
    </JsonLd>
  );
}
