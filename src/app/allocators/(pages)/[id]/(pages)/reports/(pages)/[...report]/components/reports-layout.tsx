"use client"
import {GenericContentHeader} from "@/components/generic-content-view";
import {Card, CardContent} from "@/components/ui/card";
import {
  EnableCompareButton
} from "@/app/allocators/(pages)/[id]/(pages)/reports/(pages)/[...report]/components/enable-compare.button";
import {
  useReportsDetails
} from "@/app/allocators/(pages)/[id]/(pages)/reports/(pages)/[...report]/providers/reports-details.provider";
import {format} from "date-fns";
import {cn} from "@/lib/utils";
import {
  ClientsView
} from "@/app/allocators/(pages)/[id]/(pages)/reports/(pages)/[...report]/components/clients-view/clients-view";
import {
  ProvidersView
} from "@/app/allocators/(pages)/[id]/(pages)/reports/(pages)/[...report]/components/provider-view/providers-view";

const ReportsLayout = () => {

  const {
    colsStyle,
    reports
  } = useReportsDetails()

  const parseId = (id: string) => {
    if (id.length > 10) {
      return id.substring(0, 8) + '...' + id.substring(id.length - 4)
    } else {
      return id
    }
  }

  return <div className={cn(
    reports.length > 2 ? 'mx-4' : 'main-content'
  )}>
    <Card>
      <GenericContentHeader
        header="Report Detail"
        sticky
        addons={reports.length >= 2 && <EnableCompareButton/>}
        fixedHeight={true}/>
      <CardContent className="p-0">
        <div className={cn(
          "grid border-b sticky top-[90px] bg-white z-10"
        )} style={colsStyle}>
          {
            reports.map((report, index) => {
              return <div key={index} className="[&:not(:last-child)]:border-r-2 p-4 flex gap-1 items-center">
                Report <span className="font-semibold">{parseId(report.id)}</span> from <span
                className="font-semibold">{format(new Date(report.create_date), 'yyyy-MM-dd HH:mm')}</span>
              </div>
            })
          }
        </div>
        <ClientsView/>
        <ProvidersView/>
      </CardContent>
    </Card>
  </div>

}

export {ReportsLayout}