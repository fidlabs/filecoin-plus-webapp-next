import { ScaleSymLog, scaleSymlog } from "d3-scale";
import { useLayoutEffect, useMemo, useState } from "react";
import { ScaleType } from "recharts/types/util/types";

export type Scale = ScaleType | ScaleSymLog<number, number, never> | undefined;

const useChartScale = (minValue: number, defaultValue = "linear") => {
  const [selectedScale, setSelectedScale] = useState(defaultValue);

  const scale: Scale = useMemo(() => {
    if (selectedScale === "linear") {
      return "linear" as ScaleType;
    } else if (selectedScale === "log") {
      return scaleSymlog().constant(minValue || 1);
    } else if (selectedScale === "percent") {
      return "percent" as ScaleType;
    } else {
      return "linear" as ScaleType;
    }
  }, [selectedScale, minValue]);

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
