import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {ProvidersPieChart} from "@/app/clients/(pages)/[id]/(pages)/providers/components/providers-pie-chart";
import {ProvidersBarChart} from "@/app/clients/(pages)/[id]/(pages)/providers/components/providers-bar-chart";

const ProvidersChart = () => {
  return <Tabs className="md:p-4" defaultValue="pie">
    <TabsList>
      <TabsTrigger value="pie">Pie chart</TabsTrigger>
      <TabsTrigger value="bar">Bar chart</TabsTrigger>
    </TabsList>
    <TabsContent value="pie">
      <ProvidersPieChart/>
    </TabsContent>
    <TabsContent value="bar">
      <ProvidersBarChart/>
    </TabsContent>
  </Tabs>
}

export {ProvidersChart}