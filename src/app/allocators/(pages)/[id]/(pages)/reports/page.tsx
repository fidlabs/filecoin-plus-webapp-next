import {Card, CardContent} from "@/components/ui/card";
import {GenericContentHeader} from "@/components/generic-content-view";
import {ReportsTable} from "@/app/allocators/(pages)/[id]/(pages)/reports/components/reports.table";
import {NewReportButton} from "@/app/allocators/(pages)/[id]/(pages)/reports/components/new-report.button";
import {getAllocatorReports} from "@/lib/api";
import {ITabNavigatorTab} from "@/components/ui/tab-navigator";
import { revalidatePath } from "next/cache";

interface IPageProps {
  params: { id: string }
}

const AllocatorReportsPage = async (pageParams: IPageProps) => {

  const data = await getAllocatorReports(pageParams.params.id)

  const refetch = async () => {
    'use server'
    revalidatePath(`/allocators/${pageParams.params.id}/reports`)
  }

  const tabs = [
    {
      label: 'Verified Clients',
      href: `/allocators/${pageParams.params.id}`,
      value: 'list'
    },
    {
      label: 'Allocations over time',
      href: `/allocators/${pageParams.params.id}/over-time`,
      value: 'chart'
    }, {
      label: 'Reports',
      href: `/allocators/${pageParams.params.id}/reports`,
      value: 'reports'
    }
  ] as ITabNavigatorTab[];

  return <div className="main-content">
    <Card>
      <GenericContentHeader sticky
                            navigation={tabs}
                            selected="reports"
                            fixedHeight={false}
                            addons={<NewReportButton clientId={pageParams.params.id} refetch={refetch}/>}
      />
      <CardContent className="p-0">
        {
          !data?.length && <div className="p-10 w-full gap-2 flex flex-col items-center justify-center">
            No reports found
          </div>
        }
        {
          !!data?.length && <ReportsTable reportsData={data} />
        }
      </CardContent>
    </Card>
  </div>

}

export default AllocatorReportsPage