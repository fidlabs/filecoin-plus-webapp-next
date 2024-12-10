"use client"
import {
  IClientReportStorageProviderDistribution
} from "@/lib/interfaces/cdp/cdp.interface";
import Link from "next/link";
import {ColumnDef} from "@tanstack/react-table";
import {DataTable} from "@/components/ui/data-table";
import {Badge} from "@/components/ui/badge";
import {convertBytesToIEC} from "@/lib/utils";
import {
  useReportsDetails
} from "@/app/clients/(pages)/[id]/(pages)/reports/(pages)/[...report]/providers/reports-details.provider";
import {HoverCard, HoverCardContent, HoverCardTrigger} from "@/components/ui/hover-card";
import {InfoIcon} from "lucide-react";
import {
  ReportViewProviderMap
} from "@/app/clients/(pages)/[id]/(pages)/reports/(pages)/[...report]/components/provider-view/report-view-provider-map";
import {
  ReportViewProviderHealth
} from "@/app/clients/(pages)/[id]/(pages)/reports/(pages)/[...report]/components/provider-view/report-view-provider-health";

export const useReportViewProvidersColumns = () => {
  const columns = [{
    accessorKey: "provider",
    header: () => {
      return (
        <div>
          Provider
        </div>
      )
    },
    cell: ({row}) => {
      const provider = row.getValue('provider') as string
      return <Link className="table-link" href={`/storage-providers/${provider}`}>{provider}</Link>
    }
  }, {
    accessorKey: "location",
    header: () => {
      return (
        <div>
          Location
        </div>
      )
    }, cell: ({row}) => {
      const rawLocation = row.original.location;
      return <div>
        <div>{rawLocation.city}, {rawLocation.region}, {rawLocation.country}</div>
        <Badge variant="outline"
               className="rounded-sm text-xs font-medium text-muted-foreground">{rawLocation.org}</Badge>
      </div>
    }
  }, {
    accessorKey: "total_deal_size",
    header: () => {
      return (
        <div>
          Total Deal Size
        </div>
      )
    }, cell: ({row}) => {
      const totalDealSize = row.getValue('total_deal_size') as number
      return <div>{convertBytesToIEC(totalDealSize)}</div>
    }
  }, {
    accessorKey: "total_deal_percentage",
    header: () => {
      return (
        <div>
          Percentage
        </div>
      )
    }, cell: ({row}) => {
      const percentage = row.getValue('total_deal_percentage') as number

      return <div>{percentage.toFixed(2)}%</div>
    }
  }, {
    accessorKey: "duplication_percentage",
    header: () => {
      return (
        <div>
          Duplication
        </div>
      )
    }, cell: ({row}) => {
      const duplication = row.getValue('duplication_percentage') as number
      const duplicatedDataSize = row.original.duplicated_data_size

      return <div className="h-full flex items-center justify-center gap-1">
        <div>{duplication.toFixed(2)}%</div>
        {!!duplicatedDataSize && <HoverCard>
          <HoverCardTrigger asChild>
            <InfoIcon size={15} className="text-muted-foreground cursor-help"/>
          </HoverCardTrigger>
          <HoverCardContent>
            <div>
              <div className="text-sm">Duplicated Data Size: {convertBytesToIEC(duplicatedDataSize)}</div>
            </div>
          </HoverCardContent>
        </HoverCard>}
      </div>
    }
  }] as ColumnDef<IClientReportStorageProviderDistribution>[]

  return {columns}
}


const ReportViewProviders = () => {

  const {
    columns
  } = useReportViewProvidersColumns();

  const {
    providerDistributionList,
  } = useReportsDetails()

  const colsStyle = {
    gridTemplateColumns: `repeat(${providerDistributionList.length}, minmax(0, 1fr))`
  }

  const colsSpanStyle = {
    gridColumn: `span ${providerDistributionList.length} / span ${providerDistributionList.length}`
  }


  return <div className="grid" style={colsStyle}>
    <div className="p-4 border-b" style={colsSpanStyle}>
      <div className="flex gap-2 items-center">
        <h2 className="font-semibold text-lg">Storage Provider Distribution</h2>
        <HoverCard>
          <HoverCardTrigger asChild>
            <InfoIcon size={20} className="text-muted-foreground cursor-help"/>
          </HoverCardTrigger>
          <HoverCardContent className="w-full mx-6">
            <p>For most of the datacap application, below restrictions should apply.</p>
            <ul className="list-disc">
              <li className="ml-4">Storage provider should not exceed 25% of total datacap.</li>
              <li className="ml-4">Storage provider should not be storing duplicate data for more than 20%.</li>
              <li className="ml-4">Storage provider should have published its public IP address.</li>
              <li className="ml-4">All storage providers should be located in different regions.</li>
            </ul>
          </HoverCardContent>
        </HoverCard>
      </div>
      <p className="pt-2">The below table shows the distribution of storage providers that have stored data for this
        client.</p>
    </div>
    {
      providerDistributionList.map((providerDistribution, index) => {
        return <div key={index} className="border-b [&:not(:last-child)]:border-r-2">
          <ReportViewProviderHealth providerDistribution={providerDistribution}/>
          <div className="border-b border-t">
            <DataTable columns={columns} data={providerDistribution}/>
          </div>
          <ReportViewProviderMap providerDistribution={providerDistribution}/>
        </div>
      })
    }
  </div>
}

export {ReportViewProviders}