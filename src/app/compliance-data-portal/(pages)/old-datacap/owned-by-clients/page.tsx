import { ClientsPageSectionId } from "@/lib/constants";
import { permanentRedirect } from "next/navigation";

export default async function OldDatacapOwnedByClientsPage() {
  permanentRedirect(`/clients#${ClientsPageSectionId.OLD_DATACAP}`);
}
