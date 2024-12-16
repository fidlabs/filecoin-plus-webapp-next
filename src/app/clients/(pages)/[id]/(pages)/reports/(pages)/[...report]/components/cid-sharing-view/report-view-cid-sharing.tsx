"use client"
import {
  useReportsDetails
} from "@/app/clients/(pages)/[id]/(pages)/reports/(pages)/[...report]/providers/reports-details.provider";
import {
  ReportViewCidSharingTable
} from "@/app/clients/(pages)/[id]/(pages)/reports/(pages)/[...report]/components/cid-sharing-view/report-view-cid-sharing-table";
import {
  ReportViewCidSharingHealth
} from "@/app/clients/(pages)/[id]/(pages)/reports/(pages)/[...report]/components/cid-sharing-view/report-view-cid-sharing-health";


const ReportViewCidSharing = () => {
  const {
    cidSharingList,
    colsStyle,
    colsSpanStyle
  } = useReportsDetails()

  return <div className="grid" style={colsStyle}>
    <div className="p-4 border-b" style={colsSpanStyle}>
      <h2 className="font-semibold text-lg">Deal Data Shared with other Clients</h2>
      <p>The below table shows how many unique data are shared with other clients. Usually different applications owns
        different data and should not resolve to the same CID.</p>
      <p>However, this could be possible if all below clients use same software to prepare for the exact same dataset or
        they belong to a series of LDN applications for the same dataset.</p>
    </div>
    {
      cidSharingList.map((cidSharingData, index) => {
        return <div key={index} className="border-b [&:not(:last-child)]:border-r-2">
          <ReportViewCidSharingHealth cidSharingData={cidSharingData}/>
          <ReportViewCidSharingTable cidSharingData={cidSharingData}/>
        </div>
      })
    }
  </div>
}

export {ReportViewCidSharing}