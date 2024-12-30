import {useGoogleSheetsAuditReport} from "@/lib/hooks/google.hooks";
import {useState} from "react";
import {ChartWrapper} from "@/app/compliance-data-portal/components/chart-wrapper";
import {AuditHistoryBarGraph} from "@/components/charts/compliance/graphs/audits-history-graph";
import {Checkbox} from "@/components/ui/checkbox";

interface Props {
  currentElement?: string;
  plain?: boolean;
}

const AllocatorAuditState = ({currentElement, plain}: Props) => {
  const {results, loading} = useGoogleSheetsAuditReport();

  const [showActive, setShowActive] = useState(true);
  const [showAudited, setShowAudited] = useState(true);
  const [hideWaiting, setHideWaiting] = useState(false);

  if (!!currentElement && currentElement !==  'AuditStateAllocator') {
    return null;
  }

  return <ChartWrapper
    title="Audit state of the allocators"
    id="AuditStateAllocator"
    plain={plain}
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
          Show only active allocators
        </div>
        <div className="flex gap-1 items-center">
          <Checkbox checked={showAudited} onCheckedChange={(checked) => {
            setShowAudited(!!checked)
            if (!!checked) {
              setShowActive(true)
            }
          }}>Show active</Checkbox>
          Show only audited allocators
        </div>
        <div className="flex gap-1 items-center">
          <Checkbox checked={hideWaiting} onCheckedChange={(checked) => {
            setHideWaiting(!!checked)
          }}>Show active</Checkbox>
          Hide waiting audits for audited allocators
        </div>
      </div>
    }]}
  >
    <AuditHistoryBarGraph data={results?.data} audits={results?.audits} isLoading={loading} showActive={showActive} hideWaiting={hideWaiting} showAudited={showAudited}/>
  </ChartWrapper>;
};

export {AllocatorAuditState};
