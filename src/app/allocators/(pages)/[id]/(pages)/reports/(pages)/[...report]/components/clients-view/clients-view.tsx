"use client"
import {
  useReportsDetails
} from "@/app/allocators/(pages)/[id]/(pages)/reports/(pages)/[...report]/providers/reports-details.provider";
import {
  ClientsViewTable
} from "@/app/allocators/(pages)/[id]/(pages)/reports/(pages)/[...report]/components/clients-view/clients-view-table";
import {useScrollObserver} from "@/lib/hooks/useScrollObserver";
import {cn} from "@/lib/utils";

const ClientsView = () => {
  const {
    clients,
    colsStyle,
    colsSpanStyle
  } = useReportsDetails()

  const {
    top, ref
  } = useScrollObserver()

  return <div className="grid" style={colsStyle}>
    <div ref={ref} className={cn(
      "p-4 border-b sticky top-[147px] bg-white",
      top > 90 && "z-[5]",
      top === 147 && "shadow-md"
    )} style={colsSpanStyle}>
      <h2 className="font-semibold text-lg">Clients overview</h2>
      {/*<p>XXX</p>*/}
    </div>
    {
      clients.map((client, index) => {
        return <div key={index} className="border-b [&:not(:last-child)]:border-r-2">
          <ClientsViewTable clients={client}/>
        </div>
      })
    }
  </div>
}

export {ClientsView}