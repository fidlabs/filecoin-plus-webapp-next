"use client"
import {
  useReportsDetails
} from "@/app/allocators/(pages)/[id]/(pages)/reports/(pages)/[...report]/providers/reports-details.provider";
import {
  ClientsViewTable
} from "@/app/allocators/(pages)/[id]/(pages)/reports/(pages)/[...report]/components/clients-view/clients-view-table";

const ClientsView = () => {
  const {
    clients,
    colsStyle,
    colsSpanStyle
  } = useReportsDetails()

  return <div className="grid" style={colsStyle}>
    <div className="p-4 border-b" style={colsSpanStyle}>
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