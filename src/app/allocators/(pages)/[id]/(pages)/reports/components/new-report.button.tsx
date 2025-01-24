"use client"

import {Button} from "@/components/ui/button";
import {LoaderCircle} from "lucide-react";
import {useCallback, useState} from "react";
import {generateAllocatorReport} from "@/lib/api";

interface IProps {
  clientId: string
  refetch: () => void
}

const NewReportButton = ({clientId, refetch}: IProps) => {
  const [reportGenerating, setReportGenerating] = useState(false)
  const generateNewReport = useCallback(() => {
    setReportGenerating(true);
    generateAllocatorReport(clientId)
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
