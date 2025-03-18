"use client";

import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTrigger,
} from "@/components/ui/responsive-dialog";
import { IGenericReportLocation } from "@/lib/interfaces/cdp/cdp.interface";
import countriesGeo from "@/lib/map-assets/countries.json";
import { uniq } from "lodash";
import {
  ExpandIcon,
  LocateFixedIcon,
  ShrinkIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Graticule,
  Marker,
  ZoomableGroup,
  ZoomableGroupProps,
} from "react-simple-maps";
import { DimensionsBox } from "./dimensions-box";
import { Button } from "./ui/button";
import { Dialog, DialogClose, DialogContent, DialogTrigger } from "./ui/dialog";

type MoveEndHandler = NonNullable<ZoomableGroupProps["onMoveEnd"]>;
type Position = Parameters<MoveEndHandler>[0];

interface IGenericProviderMapProps {
  markerGroups: { [key: string]: IGenericReportLocation[] };
}

const initialPosition: Position = {
  coordinates: [0, 0],
  zoom: 1,
};

const Map = ({ markerGroups }: IGenericProviderMapProps) => {
  const [position, setPosition] = useState<Position>(initialPosition);

  const handleZoomIn = useCallback(() => {
    setPosition((currentPosition) => {
      if (currentPosition.zoom >= 4) {
        return currentPosition;
      }

      return {
        ...currentPosition,
        zoom: currentPosition.zoom * 2,
      };
    });
  }, []);

  const handleZoomOut = useCallback(() => {
    setPosition((currentPosition) => {
      if (currentPosition.zoom <= 1) {
        return currentPosition;
      }

      return {
        ...currentPosition,
        zoom: currentPosition.zoom / 2,
      };
    });
  }, []);

  const handleCenter = useCallback(() => {
    setPosition((currentPosition) => ({
      ...currentPosition,
      coordinates: [0, 0],
    }));
  }, []);

  const handleMoveEnd = useCallback<MoveEndHandler>((nextPosition) => {
    setPosition(nextPosition);
  }, []);

  const handleDialogOpenChange = useCallback((open: boolean) => {
    // Reset position on dialog close
    if (!open) {
      setPosition(initialPosition);
    }
  }, []);

  if (!Object.keys(markerGroups).length) {
    return null;
  }

  const mapContent = (
    <>
      <Graticule stroke="#E4E5E6" strokeWidth={0.5} />
      <Geographies geography={countriesGeo}>
        {({ geographies }) =>
          geographies.map((geo) => (
            <Geography
              key={geo.rsmKey}
              geography={geo}
              fill="#22222211"
              stroke="#222"
            />
          ))
        }
      </Geographies>
      {Object.values(markerGroups).map((locations, index) => {
        const location = locations[0];

        if (!location) {
          return null;
        }

        const names = uniq(
          locations
            .filter((location) => !!location)
            .map((location) => location.org)
        );

        return (
          <Marker
            key={`${index}_${location.org}_${location.provider_distribution_id}`}
            coordinates={[
              +location.loc.split(",")[1],
              +location.loc.split(",")[0],
            ]}
          >
            <ResponsiveDialog>
              <ResponsiveDialogTrigger asChild>
                <circle
                  r={8}
                  fill="#0090FF"
                  stroke="#fff"
                  cursor="pointer"
                  strokeWidth={2}
                />
              </ResponsiveDialogTrigger>
              <ResponsiveDialogContent>
                <ResponsiveDialogHeader>
                  <div className="text-muted-foreground font-semibold text-sm">
                    {location.region}, {location.country}
                  </div>
                </ResponsiveDialogHeader>
                {names.map((location, index) => {
                  return <div key={index}>{location}</div>;
                })}
              </ResponsiveDialogContent>
            </ResponsiveDialog>
          </Marker>
        );
      })}
    </>
  );

  return (
    <div className="relative">
      <ComposableMap
        height={560}
        projection="geoMercator"
        projectionConfig={{
          center: [0, 45],
          scale: 128,
        }}
      >
        {mapContent}
      </ComposableMap>

      <Dialog onOpenChange={handleDialogOpenChange}>
        <DialogTrigger asChild>
          <Button
            title="Open in Full Screen"
            className="absolute top-2 right-2"
            size="icon"
          >
            <ExpandIcon />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-screen h-screen sm:rounded-none p-0">
          <DimensionsBox className="w-full h-full relative">
            {({ width, height }) => (
              <>
                <ComposableMap
                  projection="geoMercator"
                  className="w-full h-full"
                  width={width}
                  height={height / 2}
                  projectionConfig={{
                    center: [0, 45],
                  }}
                >
                  <ZoomableGroup
                    center={position.coordinates}
                    zoom={position.zoom}
                    onMoveEnd={handleMoveEnd}
                  >
                    {mapContent}
                  </ZoomableGroup>
                </ComposableMap>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 [&>button]:rounded-none [&>button:first-child]:rounded-l-md [&>button:last-child]:rounded-r-md">
                  <Button
                    title="Center Map"
                    size="icon"
                    disabled={position.coordinates.every((i) => i === 0)}
                    onClick={handleCenter}
                  >
                    <LocateFixedIcon />
                  </Button>

                  <Button
                    title="Zoom Out"
                    size="icon"
                    disabled={position.zoom <= 1}
                    onClick={handleZoomOut}
                  >
                    <ZoomOutIcon />
                  </Button>

                  <Button
                    title="Zoom In"
                    size="icon"
                    disabled={position.zoom >= 4}
                    onClick={handleZoomIn}
                  >
                    <ZoomInIcon />
                  </Button>

                  <DialogClose asChild>
                    <Button title="Exit Full Screen" size="icon">
                      <ShrinkIcon />
                    </Button>
                  </DialogClose>
                </div>
              </>
            )}
          </DimensionsBox>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const GenericProviderMap = dynamic(() => Promise.resolve(Map), { ssr: false });

export { GenericProviderMap };
