"use client"


import {useClientDetails} from "@/app/clients/(pages)/[id]/components/client.provider";
import {Button} from "@/components/ui/button";
import {LoaderCircle} from "lucide-react";

const NewReportButton = () => {
  const {generateNewReport, reportGenerating} = useClientDetails()

  return <Button variant={"outline"}
                 className="min-w-[150px]"
                 disabled={reportGenerating}
                 onClick={generateNewReport}>
    {
      reportGenerating ? <LoaderCircle className="animated animate-spin"/> : 'Generate report'
    }
  </Button>
}

export {NewReportButton}
