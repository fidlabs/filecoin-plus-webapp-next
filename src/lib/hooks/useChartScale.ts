import { useLayoutEffect, useMemo, useState } from "react";
import { ScaleType } from "recharts/types/util/types";

export type Scale = ScaleType | undefined;

const useChartScale = (_minValue: number, defaultValue = "linear") => {
  const [selectedScale, setSelectedScale] = useState(defaultValue);

  const scale: Scale = useMemo(() => {
    if (selectedScale === "linear") {
      return "linear" as ScaleType;
    } else if (selectedScale === "log") {
      return "symlog";
    } else if (selectedScale === "percent") {
      return "percent" as ScaleType;
    } else {
      return "linear" as ScaleType;
    }
  }, [selectedScale]);

  useLayoutEffect(() => {
    const cacheScale = localStorage.getItem("complianceDataPortalChartScale");
    if (cacheScale) {
      setSelectedScale(cacheScale);
    }
  }, []);

  const setSelectedScaleCache = (value: string) => {
    setSelectedScale(value);
    localStorage.setItem("complianceDataPortalChartScale", value);
  };

  const calcPercentage = useMemo(() => {
    return selectedScale === "percent";
  }, [selectedScale]);

  return {
    scale,
    selectedScale,
    calcPercentage,
    setSelectedScale: setSelectedScaleCache,
  };
};

export { useChartScale };
