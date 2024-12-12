"use client"
import {
  IClientReportStorageProviderDistribution
} from "@/lib/interfaces/cdp/cdp.interface";
import {ComposableMap, Geographies, Geography, Graticule, Marker, Sphere} from "react-simple-maps";
import countriesGeo from "@/lib/map-assets/countries.json"
import {groupBy, uniq} from "lodash";
import {
  useReportsDetails
} from "@/app/clients/(pages)/[id]/(pages)/reports/(pages)/[...report]/providers/reports-details.provider";
import {useMemo} from "react";
import {HoverCard, HoverCardContent, HoverCardTrigger} from "@/components/ui/hover-card";

interface IReportViewProviderMapProps {
  providerDistribution: IClientReportStorageProviderDistribution[]
}

const ReportViewProviderMap = ({providerDistribution}: IReportViewProviderMapProps) => {

  const {
    mapsConstraints
  } = useReportsDetails()

  const markerGroups = useMemo(() => groupBy(providerDistribution.filter(item => !item.not_found).map(item => item.location), 'loc'), [providerDistribution])

  return <ComposableMap width={1400} projection="geoEqualEarth" projectionConfig={{
    center: mapsConstraints.center,
    scale: mapsConstraints.scale
  }}>
    <Sphere id="sphere" fill="none" stroke="#E4E5E6" strokeWidth={0.5}/>
    <Graticule stroke="#E4E5E6" strokeWidth={0.5}/>
    <Geographies geography={countriesGeo}>
      {({geographies}) =>
        geographies.map((geo) => (
          <Geography key={geo.rsmKey} geography={geo} fill="#22222211" stroke="#222"/>
        ))
      }
    </Geographies>
    {Object.keys(markerGroups).map(key => {
      const location = markerGroups[key][0];
      const names = uniq(markerGroups[key].map(location => location.org))
      return <Marker key={`${providerDistribution[0].client_report_id}_${location.org}_${location.provider_distribution_id}`} coordinates={[+location.loc.split(',')[1], +location.loc.split(',')[0]]}>
        <HoverCard>
          <HoverCardTrigger>
            <circle r={10} fill="#0090FF" stroke="#fff" cursor="pointer" strokeWidth={2}/>
          </HoverCardTrigger>
          <HoverCardContent>
            {
              names.map((location, index) => {
                return <text
                  key={location}
                  filter="url(#solid)"
                  textAnchor="middle"
                  y={-15 - (index * 20)}
                  style={{fill: "black"}}
                >
                  {location}
                </text>
              })
            }
          </HoverCardContent>
        </HoverCard>

      </Marker>
    })}
  </ComposableMap>
}

export {ReportViewProviderMap}