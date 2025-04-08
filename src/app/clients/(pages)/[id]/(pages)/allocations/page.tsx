import { GenericContentHeader } from "@/components/generic-content-view";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AllocationsListTable } from "@/app/clients/(pages)/[id]/(pages)/allocations/components/allocations-list-table";
import { AllocatorsListTable } from "@/app/clients/(pages)/[id]/(pages)/allocations/components/allocators-list-table";
import { AllocationsChart } from "@/app/clients/(pages)/[id]/(pages)/allocations/components/allocations-chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getClientAllocationsById } from "@/lib/api";
import { ITabNavigatorTab } from "@/components/ui/tab-navigator";

interface IPageProps {
  params: { id: string };
}

const ClientAllocationsPage = async (pageParams: IPageProps) => {
  const data = await getClientAllocationsById(pageParams.params.id);

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
    <div className="main-content">
      <Card>
        <GenericContentHeader
          placeholder="Storage Provider ID"
          sticky
          navigation={tabs}
          selected="allocations"
          fixedHeight={false}
        />
        <CardContent className="p-0">
          <Tabs defaultValue="table">
            <TabsList className="mx-4 my-2">
              <TabsTrigger value="table">Allocations table</TabsTrigger>
              <TabsTrigger value="chart">Allocations chart</TabsTrigger>
            </TabsList>
            <TabsContent value="table">
              <AllocationsListTable allocationsData={data} />
            </TabsContent>
            <TabsContent value="chart">
              <AllocationsChart allocationsData={data} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      <Card className="mt-4">
        <CardHeader className="sticky top-0 bg-white z-10 rounded-t-lg">
          <CardTitle className="text-xl">Allocators</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <AllocatorsListTable allocationsData={data} />
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientAllocationsPage;
