import {Metadata} from "next";
import {ClientsList} from "@/app/clients/components/clients-list";

export const metadata: Metadata = {
  title: "Fil+ Dashboard | Clients",
  description: "Fil+ Dashboard | Clients",
}

const ClientsPage = () => {
  return <ClientsList/>
};

export default ClientsPage;