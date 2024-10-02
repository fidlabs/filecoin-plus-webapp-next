import {Metadata} from "next";
import {ClientsList} from "@/app/clients/components/clients-list";
import {Suspense} from "react";
import {PageHeader, PageTitle} from "@/components/ui/title";

export const metadata: Metadata = {
  title: "Fil+ Dashboard | Clients",
  description: "Fil+ Dashboard | Clients",
}

const ClientsPage = () => {
  return <div>
    <PageHeader>
      <PageTitle>Clients</PageTitle>
    </PageHeader>
    <Suspense>
      <ClientsList/>
    </Suspense>
  </div>
};

export default ClientsPage;