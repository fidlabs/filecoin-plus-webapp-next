import {getClientProviderBreakdownById} from "@/lib/api";
import {ProvidersList} from "@/app/clients/(pages)/[id]/(pages)/providers/components/client-providers";
import {Card} from "@/components/ui/card";
import {GenericContentHeader} from "@/components/generic-content-view";
import {ITabNavigatorTab} from "@/components/ui/tab-navigator";

interface IPageProps {
  params: { id: string }
}

const ClientProviderBreakdownPage = async (pageParams: IPageProps) => {

  const clientId = pageParams.params.id
  const data = await getClientProviderBreakdownById(clientId)

  const tabs = [
      {
        label: 'Latest claims',
        href: `/clients/${clientId}`,
        value: 'list'
      },
      {
        label: 'Providers',
        href: `/clients/${clientId}/providers`,
        value: 'providers'
      },
      {
        label: 'Allocations',
        href: `/clients/${clientId}/allocations`,
        value: 'allocations'
      },
      {
        label: 'Reports',
        href: `/clients/${clientId}/reports`,
        value: 'reports'
      }
    ] as ITabNavigatorTab[];

  return <div className="main-content">
    <Card>
      <GenericContentHeader sticky
                            navigation={tabs}
                            selected="providers"
                            fixedHeight={false}
      />
      <ProvidersList data={data}/>

    </Card>
  </div>
}

export default ClientProviderBreakdownPage