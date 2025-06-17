import { getClientProviderBreakdownById } from "@/lib/api";
import { ProvidersList } from "@/app/clients/(pages)/[id]/(pages)/providers/components/client-providers";
import { Card } from "@/components/ui/card";
import { GenericContentHeader } from "@/components/generic-content-view";
import { ITabNavigatorTab } from "@/components/ui/tab-navigator";

export const revalidate = 300;

interface PageProps {
  params: { id: string };
}

export default async function ClientProviderBreakdownPage(
  pageParams: PageProps
) {
  const clientId = pageParams.params.id;
  const data = await getClientProviderBreakdownById(clientId);

  const tabs = [
    {
      label: "Latest claims",
      href: `/clients/${clientId}`,
      value: "list",
    },
    {
      label: "Providers",
      href: `/clients/${clientId}/providers`,
      value: "providers",
    },
    {
      label: "Allocations",
      href: `/clients/${clientId}/allocations`,
      value: "allocations",
    },
    {
      label: "Reports",
      href: `/clients/${clientId}/reports`,
      value: "reports",
    },
  ] as ITabNavigatorTab[];

  return (
    <div className="main-content">
      <Card>
        <GenericContentHeader
          sticky
          navigation={tabs}
          selected="providers"
          fixedHeight={false}
        />

        {data.stats.length === 0 && (
          <div className="p-6">
            <p className="text-center text-muted-foreground">
              Nothing to show.
            </p>
          </div>
        )}
        {data.stats.length > 0 && <ProvidersList data={data} />}
      </Card>
    </div>
  );
}
