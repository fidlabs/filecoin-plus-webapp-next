import { NewReportButton } from "@/app/clients/(pages)/[id]/(pages)/reports/components/new-report.button";
import { ReportsTable } from "@/app/clients/(pages)/[id]/(pages)/reports/components/reports.table";
import { Container } from "@/components/container";
import { GenericContentHeader } from "@/components/generic-content-view";
import { Card, CardContent } from "@/components/ui/card";
import { ITabNavigatorTab } from "@/components/ui/tab-navigator";
import { getClientReports } from "@/lib/api";
import { revalidatePath } from "next/cache";

interface PageProps {
  params: { id: string };
}

export default async function ClientReportsPage(pageParams: PageProps) {
  const data = await getClientReports(pageParams.params.id);

  const refetch = async () => {
    "use server";
    revalidatePath(`/clients/${pageParams.params.id}/reports`);
  };

  const tabs = [
    {
      label: "Latest claims",
      href: `/clients/${pageParams.params.id}`,
      value: "list",
    },
    {
      label: "Providers",
      href: `/clients/${pageParams.params.id}/providers`,
      value: "providers",
    },
    {
      label: "Allocations",
      href: `/clients/${pageParams.params.id}/allocations`,
      value: "allocations",
    },
    {
      label: "Reports",
      href: `/clients/${pageParams.params.id}/reports`,
      value: "reports",
    },
  ] as ITabNavigatorTab[];

  return (
    <Container>
      <Card>
        <GenericContentHeader
          placeholder="Storage Provider ID"
          sticky
          navigation={tabs}
          selected="reports"
          fixedHeight={false}
          addons={
            <NewReportButton
              clientId={pageParams.params.id}
              refetch={refetch}
            />
          }
        />
        <CardContent className="p-0">
          {!data?.length && (
            <div className="p-10 w-full gap-2 flex flex-col items-center justify-center">
              No reports found
            </div>
          )}
          {!!data?.length && <ReportsTable reportsData={data} />}
        </CardContent>
      </Card>
    </Container>
  );
}
