import { getClientReports } from "@/lib/api";
import { redirect } from "next/navigation";

interface Props {
  params: { clientId: string };
}

export const revalidate = 3600;

// This is just a proxy route to redirect to most recent report of a client
export default async function LatestClientReportPage({ params }: Props) {
  const reports = await getClientReports(params.clientId);

  if (reports.length === 0) {
    return redirect(`/clients/${params.clientId}/reports`);
  }

  return redirect(`/clients/${params.clientId}/reports/${reports[0].id}`);
}
