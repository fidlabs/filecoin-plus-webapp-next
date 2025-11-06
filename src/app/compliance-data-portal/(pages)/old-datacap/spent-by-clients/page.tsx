import { ClientsPageSectionId } from "@/lib/constants";
import { permanentRedirect } from "next/navigation";

export default async function OldDatacapSpentByClientsPage() {
  permanentRedirect(`/clients#${ClientsPageSectionId.OLD_DATACAP}`);
}
