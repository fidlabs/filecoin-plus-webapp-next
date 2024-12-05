"use client"
import {GenericContentHeader} from "@/components/generic-content-view";
import {Card, CardContent} from "@/components/ui/card";
import {
  ReportViewProviders
} from "@/app/clients/(pages)/[id]/(pages)/reports/(pages)/[...report]/components/report-view-providers";
import {
  EnableCompareButton
} from "@/app/clients/(pages)/[id]/(pages)/reports/(pages)/[...report]/components/enable-compare.button";
import {cn} from "@/lib/utils";
import {
  useReportsDetails
} from "@/app/clients/(pages)/[id]/(pages)/reports/(pages)/[...report]/components/reports-details.provider";
import {format} from "date-fns";

const ReportsLayout = () => {

  const {
    reports
  } = useReportsDetails()

  return <Card>
    <GenericContentHeader
      header="Report Detail"
      sticky
      addons={<EnableCompareButton/>}
      fixedHeight={false}/>
    <CardContent className="p-0">
      <div className={cn("grid border-b", `grid-cols-${reports.length}`)}>
        {
          reports.map((report, index) => {
            return <div key={index} className="[&:not(:last-child)]:border-r p-4">
              Report <span className="font-semibold">{report.id}</span> from <span className="font-semibold">{format(new Date(report.create_date), 'yyyy-MM-dd HH:mm')}</span>
            </div>
          })
        }
      </div>
      <ReportViewProviders/>
    </CardContent>
  </Card>

}

export {ReportsLayout}