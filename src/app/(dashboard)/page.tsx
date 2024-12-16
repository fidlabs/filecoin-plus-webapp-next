import {PageHeader, PageSubTitle, PageTitle} from "@/components/ui/title";
import {Stats} from "@/app/(dashboard)/components/stats";
import {DatacapFlow} from "@/app/(dashboard)/components/datacap-flow";
import {Charts} from "@/app/(dashboard)/components/charts";

export default async function Home() {

  return (
    <main className="main-content flex flex-col gap-8 items-start">
      <PageHeader>
        <PageTitle>State of Fil+</PageTitle>
        <PageSubTitle>Quick statistics and metrics about the Filecoin Plus program.</PageSubTitle>
      </PageHeader>
      <div className="flex flex-col gap-6 w-full">
        <Stats/>
        <Charts/>
        <DatacapFlow/>
      </div>
    </main>
  );
}
