import { redirect } from "next/navigation";

export default function CompliancePage() {
  return redirect(`/compliance-data-portal/old-datacap/owned-by-entities`);
}
