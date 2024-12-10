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

interface IReportViewProviderMapProps {
  providerDistribution: IClientReportStorageProviderDistribution[]
}

const ReportViewProviderMap = ({providerDistribution}: IReportViewProviderMapProps) => {

  const {
    mapsConstraints
  } = useReportsDetails()

  const markerGroups = useMemo(() => groupBy(providerDistribution.map(item => item.location), 'loc'), [providerDistribution])

  return <ComposableMap width={1400} projection="geoEqualEarth" projectionConfig={{
      center: mapsConstraints.center,
      scale: mapsConstraints.scale
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
      {Object.keys(markerGroups).map(key => {
        const location = markerGroups[key][0];
        const names = uniq(markerGroups[key].map(location => location.org))
        return <Marker key={location.org} coordinates={[+location.loc.split(',')[1], +location.loc.split(',')[0]]}>
          <defs>
            <filter x="0" y="0" width="1" height="1" id="solid">
              <feFlood floodColor="#FFF" result="bg"/>
              <feMerge>
                <feMergeNode in="bg"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <circle r={10} fill="#0090FF" stroke="#fff" strokeWidth={2}/>
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
        </Marker>
      })}
    </ComposableMap>
}

export {ReportViewProviderMap}