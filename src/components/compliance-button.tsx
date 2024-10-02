import {useState} from 'react';
import {toast} from 'sonner';
import {Button} from "@/components/ui/button";
import {LoaderCircleIcon} from "lucide-react";

interface IProps {
  id: string;
}

const ComplianceDownloadButton = ({id}: IProps) => {

  const [complianceLoading, setComplianceLoading] = useState(false);

  const generateComplianceReport = async () => {
    setComplianceLoading(true);

    try {
      const apiResult = await fetch(`https://compliance.allocator.tech/report/${id}`);
      if (!apiResult.ok) {
        const result = await apiResult.json();
        throw new Error(result?.message || 'Unable to generate compliance report');
      }

      const result = await apiResult.json();
      if (!!result?.generatedReportUrl) {
        window.open(result.generatedReportUrl, '_blank')?.focus();
      } else {
        throw new Error('Unable to generate compliance report');
      }
    } catch (e: unknown) {
      toast.error((e as Error).message);
    }


    setComplianceLoading(false);
  }
  return <div aria-disabled={complianceLoading}>
    <Button
      variant="outline"
      className="w-full md:min-w-[160px] md:w-auto"
      disabled={complianceLoading}
      onClick={generateComplianceReport}
    >
      {!complianceLoading && <span>Compliance report</span>}
      {complianceLoading && <LoaderCircleIcon className="animate-spin"/>}
    </Button>
  </div>
}

export {ComplianceDownloadButton};