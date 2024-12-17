import {Metadata} from "next";
import {ClientsList} from "@/app/clients/components/clients-list";
import {Suspense} from "react";
import {PageHeader, PageSubTitle, PageTitle} from "@/components/ui/title";

export const metadata: Metadata = {
  title: "Fil+ Dashboard | Clients",
  description: "Fil+ Dashboard | Clients",
}

const ClientsPage = () => {
  return <main className="main-content">
    <PageHeader>
      <PageTitle>Clients</PageTitle>
      <PageSubTitle>View all clients participating in Filecoin</PageSubTitle>
    </PageHeader>
    <Suspense>
      <ClientsList/>
    </Suspense>
  </main>
};

export default ClientsPage;