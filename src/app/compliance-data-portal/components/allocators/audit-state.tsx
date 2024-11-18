import {useGoogleSheetsAuditReport} from "@/lib/hooks/google.hooks";
import {useScrollObserver} from "@/lib/hooks/useScrollObserver";
import {useEffect, useState} from "react";
import {ChartWrapper} from "@/app/compliance-data-portal/components/chart-wrapper";
import {AuditHistoryBarGraph} from "@/app/compliance-data-portal/components/graphs/audits-history-graph";
import {Checkbox} from "@/components/ui/checkbox";


interface Props {
  setCurrentElement: (val: string) => void
}

const AllocatorAuditState = ({setCurrentElement}: Props) => {
  const {results, loading} = useGoogleSheetsAuditReport();

  const {top, ref} = useScrollObserver();

  const [showActive, setShowActive] = useState(true);
  const [showAudited, setShowAudited] = useState(true);

  useEffect(() => {
    if (top > 0 && top < 300) {
      setCurrentElement('AuditStateAllocator');
    }
  }, [setCurrentElement, top]);

  return <ChartWrapper
    title="Audit state of the allocators"
    addons={[{
      name: 'Filters',
      value: <div>
        <div className="flex gap-1 items-center">
          <Checkbox checked={showActive} onCheckedChange={(checked) => {
            setShowActive(!!checked)
            if (!checked) {
              setShowAudited(false)
            }
          }}>Show active</Checkbox>
          Show only active
        </div>
        <div className="flex gap-1 items-center">
          <Checkbox checked={showAudited} onCheckedChange={(checked) => {
            setShowAudited(!!checked)
            if (!!checked) {
              setShowActive(true)
            }
          }}>Show active</Checkbox>
          Show only audited
        </div>
      </div>
    }]}
    ref={ref}
  >
    <AuditHistoryBarGraph data={results?.data} audits={results?.audits} isLoading={loading} showActive={showActive} showAudited={showAudited}/>
  </ChartWrapper>;
};

export {AllocatorAuditState};
