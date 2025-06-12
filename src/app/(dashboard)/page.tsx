import { Charts } from "@/app/(dashboard)/components/charts";
import { DatacapFlow } from "@/app/(dashboard)/components/datacap-flow";
import { Stats } from "@/app/(dashboard)/components/stats";
import { JsonLd } from "@/components/json.ld";
import { PageHeader, PageSubTitle, PageTitle } from "@/components/ui/header";
import {
  getAllocators,
  getDataCapAllocationsWeekly,
  getDataCapAllocationsWeeklyByClient,
  getGoogleSheetAuditSizes,
  getStats,
} from "@/lib/api";
import { WebPage, WithContext } from "schema-dts";

const page: WithContext<WebPage> = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Fil+ DataCap Stats",
  image: "https://cryptologos.cc/logos/filecoin-fil-logo.png?v=040",
  description:
    "Your entry place into statistics and metrics about the Filecoin Plus program.",
};

export default async function Home() {
  const [
    stats,
    allocationWeekly,
    allocationWeeklyByClient,
    sheetData,
    allocators,
  ] = await Promise.all([
    getStats(),
    getDataCapAllocationsWeekly(),
    getDataCapAllocationsWeeklyByClient(),
    getGoogleSheetAuditSizes(),
    getAllocators({
      page: "1",
      limit: "999999",
      showInactive: "true",
    }),
  ]);

  return (
    <JsonLd data={page}>
      <PageHeader
        leftContent={
          <>
            <PageTitle>State of Fil+</PageTitle>
            <PageSubTitle>
              Quick statistics and metrics about the Filecoin Plus program
            </PageSubTitle>
          </>
        }
      />
      <main className="main-content flex flex-col gap-8 items-start">
        <div className="flex flex-col gap-6 w-full">
          <Stats />
          <Charts
            stats={stats}
            allocationWeekly={allocationWeekly}
            allocationWeeklyByClient={allocationWeeklyByClient}
            allocators={allocators}
          />
          <DatacapFlow allocatorsData={allocators} sheetData={sheetData} />
        </div>
      </main>
    </JsonLd>
  );
}
