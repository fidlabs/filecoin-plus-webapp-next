"use client"
import {
  IClientReportLocation,
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
import {ComposableMap, Geographies, Geography, Graticule, Marker, Sphere} from "react-simple-maps";
import countriesGeo from "@/lib/map-assets/countries.json"
import {uniq, uniqBy} from "lodash";

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
    mapsConstraints
  } = useReportsDetails()

  const colsStyle = {
    gridTemplateColumns: `repeat(${providerDistributionList.length}, minmax(0, 1fr))`
  }

  const colsSpanStyle = {
    gridColumn: `span ${providerDistributionList.length} / span ${providerDistributionList.length}`
  }


  return <div className="grid" style={colsStyle}>
    <div className="p-4 border-b" style={colsSpanStyle}>
      <h2 className="font-semibold text-lg">Storage Provider Distribution</h2>
      <p className="pt-2">The below table shows the distribution of storage providers that have stored data for this
        client.</p>
      <p className="pt-2">For most of the datacap application, below restrictions should apply.</p>
      <ul className="list-disc">
        <li className="ml-4">Storage provider should not exceed 25% of total datacap.</li>
        <li className="ml-4">Storage provider should not be storing duplicate data for more than 20%.</li>
        <li className="ml-4">Storage provider should have published its public IP address.</li>
        <li className="ml-4">All storage providers should be located in different regions.</li>
      </ul>
    </div>
    {
      providerDistributionList.map((providerDistribution, index) => {
        return <div key={index} className="border-b [&:not(:last-child)]:border-r-2">
          <div className="border-b">
            <DataTable columns={columns} data={providerDistribution}/>
          </div>
          <ComposableMap width={1400} projection="geoEqualEarth" projectionConfig={{
            center: mapsConstraints.center,
            scale: mapsConstraints.scale
            // scale: 400
          }}>
            <Sphere id="sphere" fill="none" stroke="#E4E5E6" strokeWidth={0.5} />
            <Graticule stroke="#E4E5E6" strokeWidth={0.5} />
            <Geographies geography={countriesGeo}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography key={geo.rsmKey} geography={geo} fill="#22222211" stroke="#222"/>
                ))
              }
            </Geographies>
            {uniqBy(providerDistribution.map(item => item.location), 'loc').map((location: IClientReportLocation) => (
              <Marker key={location.org} coordinates={[+location.loc.split(',')[1], +location.loc.split(',')[0]]}>
                <defs>
                  <filter x="0" y="0" width="1" height="1" id="solid">
                    <feFlood flood-color="white" result="bg"/>
                    <feMerge>
                      <feMergeNode in="bg"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                <circle r={10} fill="#0090FF" stroke="#fff" strokeWidth={2}/>
                <text
                  filter="url(#solid)"
                  textAnchor="middle"
                  y={25}
                  style={{fill: "black"}}
                >
                  {location.org}
                </text>
              </Marker>
            ))}
          </ComposableMap>
        </div>
      })
    }
  </div>
}

export {ReportViewProviders}