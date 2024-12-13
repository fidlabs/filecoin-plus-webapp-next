"use client"
import {GenericContentHeader} from "@/components/generic-content-view";
import {Card, CardContent} from "@/components/ui/card";
import {
  ReportViewProviders
} from "@/app/clients/(pages)/[id]/(pages)/reports/(pages)/[...report]/components/provider-view/report-view-providers";
import {
  EnableCompareButton
} from "@/app/clients/(pages)/[id]/(pages)/reports/(pages)/[...report]/components/enable-compare.button";
import {
  useReportsDetails
} from "@/app/clients/(pages)/[id]/(pages)/reports/(pages)/[...report]/providers/reports-details.provider";
import {format} from "date-fns";
import {
  ReportViewReplicas
} from "@/app/clients/(pages)/[id]/(pages)/reports/(pages)/[...report]/components/replikas-view/report-view-replikas";
import {useScrollObserver} from "@/lib/hooks/useScrollObserver";
import {cn} from "@/lib/utils";
import {
  ReportViewCidSharing
} from "@/app/clients/(pages)/[id]/(pages)/reports/(pages)/[...report]/components/cid-sharing-view/report-view-cid-sharing";

const ReportsLayout = () => {

  const {
    colsStyle,
    reports
  } = useReportsDetails()

  const {
    top, ref
  } = useScrollObserver()

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
        <div ref={ref} className={cn(
          "grid border-b sticky top-[90px] bg-white z-10",
          top === 90 && "shadow-md"
        )} style={colsStyle}>
          {
            reports.map((report, index) => {
              return <div key={index} className="[&:not(:last-child)]:border-r-2 p-4">
                Report <span className="font-semibold">{report.id}</span> from <span
                className="font-semibold">{format(new Date(report.create_date), 'yyyy-MM-dd HH:mm')}</span>
              </div>
            })
          }
        </div>
        <ReportViewProviders/>
        <ReportViewReplicas/>
        <ReportViewCidSharing/>
      </CardContent>
    </Card>
  </div>

}

export {ReportsLayout}