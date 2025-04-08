"use client";
import { useReportsDetails } from "@/app/clients/(pages)/[id]/(pages)/reports/(pages)/[...report]/providers/reports-details.provider";
import { ReportViewCidSharingTable } from "@/app/clients/(pages)/[id]/(pages)/reports/(pages)/[...report]/components/cid-sharing-view/report-view-cid-sharing-table";
import { useScrollObserver } from "@/lib/hooks/useScrollObserver";
import { cn } from "@/lib/utils";

const ReportViewCidSharing = () => {
  const { cidSharingList, colsStyle, colsSpanStyle } = useReportsDetails();

  const { top, ref } = useScrollObserver();

  return (
    <div className="grid" style={colsStyle}>
      <div
        ref={ref}
        className={cn(
          "p-4 border-b sticky top-[147px] bg-white",
          top > 90 && "z-[5]",
          top === 147 && "shadow-md"
        )}
        style={colsSpanStyle}
      >
        <h2 className="font-semibold text-lg">
          Deal Data Shared with other Clients
        </h2>
        <p>
          The below table shows how many unique data are shared with other
          clients. Usually different applications owns different data and should
          not resolve to the same CID.
        </p>
        <p>
          However, this could be possible if all below clients use same software
          to prepare for the exact same dataset or they belong to a series of
          LDN applications for the same dataset.
        </p>
      </div>
      {cidSharingList.map((cidSharingData, index) => {
        return (
          <div key={index} className="border-b [&:not(:last-child)]:border-r-2">
            <ReportViewCidSharingTable cidSharingData={cidSharingData} />
          </div>
        );
      })}
    </div>
  );
};

export { ReportViewCidSharing };
