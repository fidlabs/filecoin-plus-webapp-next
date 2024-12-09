"use client"
import {
  IClientReportReplicaDistribution
} from "@/lib/interfaces/cdp/cdp.interface";
import {ColumnDef} from "@tanstack/react-table";
import {DataTable} from "@/components/ui/data-table";
import {convertBytesToIEC} from "@/lib/utils";
import {
  useReportsDetails
} from "@/app/clients/(pages)/[id]/(pages)/reports/(pages)/[...report]/components/reports-details.provider";

export const useReportViewReplikasColumns = () => {
  const columns = [{
    accessorKey: "unique_data_size",
    header: () => {
      return (
        <div>
          Unique Data
        </div>
      )
    },
    cell: ({row}) => {
      const unique_data_size = row.getValue('total_deal_size') as number
      return <div>{convertBytesToIEC(unique_data_size)}</div>
    }
  }, {
    accessorKey: "total_deal_size",
    header: () => {
      return (
        <div>
          Total Deals
        </div>
      )
    }, cell: ({row}) => {
      const total_deal_size = row.getValue('total_deal_size') as number
      return <div>{convertBytesToIEC(total_deal_size)}</div>
    }
  }, {
    accessorKey: "num_of_replicas",
    header: () => {
      return (
        <div>
          Number of providers
        </div>
      )
    }, cell: ({row}) => {
      const num_of_replicas = row.getValue('num_of_replicas') as number
      return <div>{num_of_replicas}</div>
    }
  }, {
    accessorKey: "percentage",
    header: () => {
      return (
        <div>
          Percentage
        </div>
      )
    }, cell: ({row}) => {
      const percentage = row.getValue('percentage') as number

      return <div>{percentage}%</div>
    }
  }] as ColumnDef<IClientReportReplicaDistribution>[]

  return {columns}
}


const ReportViewReplicas = () => {

  const {
    columns
  } = useReportViewReplikasColumns();

  const {
    replikasList
  } = useReportsDetails()

  const colsStyle = {
    gridTemplateColumns: `repeat(${replikasList.length}, minmax(0, 1fr))`
  }

  const colsSpanStyle = {
    gridColumn: `span ${replikasList.length} / span ${replikasList.length}`
  }


  return <div className="grid" style={colsStyle}>
    <div className="p-4 border-b" style={colsSpanStyle}>
      <h2 className="font-semibold text-lg">Deal Data Replication</h2>
      <p className="pt-2">The below table shows how each many unique data are replicated across storage providers.</p>
      <p className="pt-2 font-semibold">Since this is the 3rd allocation, the following restrictions have been relaxed:</p>
      <ul className="list-disc">
        <li className="ml-4">No more than 80% of unique data are stored with less than 3 providers.</li>
      </ul>
    </div>
    {
      replikasList.map((replika, index) => {
        return <div key={index} className="border-b [&:not(:last-child)]:border-r">
          <DataTable columns={columns} data={replika.sort((a, b) => +a.num_of_replicas - +b.num_of_replicas)}/>
        </div>
      })
    }
  </div>
}

export {ReportViewReplicas}