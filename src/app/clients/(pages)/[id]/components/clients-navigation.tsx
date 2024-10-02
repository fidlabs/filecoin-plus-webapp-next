import {LoaderCircle} from "lucide-react";
import {IClientResponse} from "@/lib/interfaces/dmob/client.interface";
import {ITabNavigatorTab, TabNavigator} from "@/components/ui/tab-navigator";
import {useMemo} from "react";

interface IPageProps {
  selected: 'list' | 'providers' | 'allocations'
  clientId: string
  loading: boolean
  data?: IClientResponse
}

const ClientsNavigation = ({
  selected, data, loading, clientId
                              }: IPageProps) => {

  const tabs = useMemo(() => {
    return [
      {
        label: <>
          <p>
            {loading && !data && <LoaderCircle size={15} className="animate-spin"/>}
            {data?.count}
          </p>
          <p>Claims</p>
        </>,
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
      }
    ] as ITabNavigatorTab[]
  }, [clientId, data, loading])

  return <TabNavigator tabs={tabs} selected={selected}/>
}

export {ClientsNavigation}