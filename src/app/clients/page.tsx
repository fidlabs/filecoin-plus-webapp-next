import {Metadata} from "next";
import {ClientsList} from "@/app/clients/components/clients-list";
import {Suspense} from "react";

export const metadata: Metadata = {
  title: "Fil+ Dashboard | Clients",
  description: "Fil+ Dashboard | Clients",
}

const ClientsPage = () => {
  return <Suspense>
    <ClientsList/>
  </Suspense>
};

export default ClientsPage;