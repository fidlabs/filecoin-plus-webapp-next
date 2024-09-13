import {scaleSymlog} from 'd3-scale';
import {useMemo, useState} from 'react';
import {ScaleType} from "recharts/types/util/types";

const useChartScale = (minValue: number, defaultValue = 'linear') => {

  const [selectedScale, setSelectedScale] = useState(defaultValue)

  const scale = useMemo(() => {
    if (selectedScale === 'linear') {
      return "linear" as ScaleType;
    } else if (selectedScale === 'log') {
      return scaleSymlog().constant(minValue);
    }
  }, [selectedScale, minValue])

  return {
    scale,
    selectedScale,
    setSelectedScale
  }
}

export default useChartScale;
