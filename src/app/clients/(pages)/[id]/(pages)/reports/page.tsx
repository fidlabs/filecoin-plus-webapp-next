"use client"
import {Card, CardContent} from "@/components/ui/card";
import {GenericContentHeader} from "@/components/generic-content-view";
import {LoaderCircle} from "lucide-react";
import {useClientDetails} from "@/app/clients/(pages)/[id]/components/client.provider";
import {useEffect} from "react";
import {ReportsTable} from "@/app/clients/(pages)/[id]/(pages)/reports/components/reports.table";
import {NewReportButton} from "@/app/clients/(pages)/[id]/(pages)/reports/components/new-report.button";

const ClientReportsPage = () => {
  const {reportsData, tabs, loading, getReportsData} = useClientDetails()

  useEffect(() => {
    getReportsData()
  }, [getReportsData])

  return <Card>
    <GenericContentHeader placeholder="Storage Provider ID"
                          sticky
                          navigation={tabs}
                          selected="reports"
                          fixedHeight={false}
                          addons={<NewReportButton/>}
    />
    <CardContent className="p-0">
      {
        loading && !reportsData && <div className="p-10 w-full flex flex-col items-center justify-center">
          <LoaderCircle className="animate-spin"/>
        </div>
      }
      {
        !loading && !reportsData?.length && <div className="p-10 w-full gap-2 flex flex-col items-center justify-center">
          No reports found
        </div>
      }
      {
        !!reportsData?.length && <ReportsTable />
      }
    </CardContent>
  </Card>

}

export default ClientReportsPage