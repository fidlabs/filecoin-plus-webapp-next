import {ScaleSymLog, scaleSymlog} from 'd3-scale';
import {useMemo, useState} from 'react';
import {ScaleType} from "recharts/types/util/types";

export type Scale = ScaleType | ScaleSymLog<number, number, never> | undefined;

const useChartScale = (minValue: number, defaultValue = 'linear') => {

  const [selectedScale, setSelectedScale] = useState(defaultValue)

  const scale: Scale = useMemo(() => {
    if (selectedScale === 'linear') {
      return "linear" as ScaleType;
    } else if (selectedScale === 'log') {
      return scaleSymlog().constant(minValue || 1);
    }
  }, [selectedScale, minValue])

  return {
    scale,
    selectedScale,
    setSelectedScale
  }
}

export {useChartScale};
