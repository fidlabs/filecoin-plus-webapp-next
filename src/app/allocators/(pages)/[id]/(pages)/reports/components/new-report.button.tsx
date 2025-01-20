"use client"

import {Button} from "@/components/ui/button";
import {LoaderCircle} from "lucide-react";
import {useCallback, useState} from "react";
import {generateClientReport} from "@/lib/api";

interface IProps {
  clientId: string
  refetch: () => void
}

const NewReportButton = ({clientId, refetch}: IProps) => {
  const [reportGenerating, setReportGenerating] = useState(false)
  const generateNewReport = useCallback(() => {
    setReportGenerating(true);
    generateClientReport(clientId)
      .then(() => setReportGenerating(false))
      .then(refetch)
  }, [clientId, refetch])

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
