import {ComposableMap, Geographies, Geography, Graticule, Marker, Sphere} from "react-simple-maps";
import countriesGeo from "@/lib/map-assets/countries.json";
import {uniq} from "lodash";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTrigger
} from "@/components/ui/responsive-dialog";
import {IGenericReportLocation} from "@/lib/interfaces/cdp/cdp.interface";

interface IGenericProviderMapProps {
  markerGroups: {  [key: string]: IGenericReportLocation[] }
  mapsConstraints: {
    center: [number, number],
    scale: number
  }
}

const GenericProviderMap = ({markerGroups, mapsConstraints}: IGenericProviderMapProps) => {
  if (!Object.keys(markerGroups).length) {
    return undefined
  }

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
    {Object.keys(markerGroups).map((key, index) => {
      const location = markerGroups[key][0];
      const names = uniq(markerGroups[key].filter(location => !!location).map(location => location.org))
      if (!location) {
        return <></>
      }
      return <Marker key={`${index}_${location.org}_${location.provider_distribution_id}`} coordinates={[+location.loc.split(',')[1], +location.loc.split(',')[0]]}>
        <ResponsiveDialog>
          <ResponsiveDialogTrigger asChild>
            <circle r={10} fill="#0090FF" stroke="#fff" cursor="pointer" strokeWidth={2}/>
          </ResponsiveDialogTrigger>
          <ResponsiveDialogContent>
            <ResponsiveDialogHeader>
              <div className="text-muted-foreground font-semibold text-sm">{location.region}, {location.country}</div>
            </ResponsiveDialogHeader>
            {
              names.map((location, index) => {
                return <div key={index}>
                  {location}
                </div>
              })
            }
          </ResponsiveDialogContent>
        </ResponsiveDialog>

      </Marker>
    })}
  </ComposableMap>
}

export {GenericProviderMap}