import {LoaderCircle} from "lucide-react";
import {IAllocatorResponse} from "@/lib/interfaces/dmob/allocator.interface";
import {useMemo} from "react";
import {ITabNavigatorTab, TabNavigator} from "@/components/ui/tab-navigator";

interface IPageProps {
  selected: 'list' | 'chart'
  allocatorId: string
  loading: boolean
  data?: IAllocatorResponse
}

const AllocatorsNavigation = ({
                                selected, data, loading, allocatorId
                              }: IPageProps) => {

  const tabs = useMemo(() => {
    return [
      {
        label: <>
          <p>
            {loading && !data && <LoaderCircle size={15} className="animate-spin"/>}
            {data?.count}
          </p>
          <p>Verified Clients</p>
        </>,
        href: `/allocators/${allocatorId}`,
        value: 'list'
      },
      {
        label: 'Allocations over time',
        href: `/allocators/${allocatorId}/over-time`,
        value: 'chart'
      }
    ] as ITabNavigatorTab[]
  }, [allocatorId, data, loading])

  return <TabNavigator tabs={tabs} selected={selected}/>
}

export {AllocatorsNavigation}