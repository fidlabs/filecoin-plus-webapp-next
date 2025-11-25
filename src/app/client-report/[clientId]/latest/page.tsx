import { fetchClientReports } from "@/app/clients/clients-data";
import { redirect } from "next/navigation";

interface Props {
  params: { clientId: string };
}

export const revalidate = 3600;

// This is just a proxy route to redirect to most recent report of a client
export default async function LatestClientReportPage({ params }: Props) {
  const { clientId } = params;
  const reports = await fetchClientReports({ clientId });

  if (reports.length === 0) {
    return redirect(`/clients/${clientId}/reports`);
  }

  return redirect(`/clients/${clientId}/reports/${reports[0].id}`);
}
