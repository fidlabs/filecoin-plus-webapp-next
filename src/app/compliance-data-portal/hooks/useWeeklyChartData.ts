import {useCDPUtils} from "@/app/compliance-data-portal/providers/cdp.provider";
import {useEffect, useMemo, useState} from "react";
import {format} from "date-fns";
import {uniq} from "lodash";
import {ICDPWeek} from "@/lib/interfaces/cdp/cdp.interface";
import {gradientPalette} from "@/lib/utils";

interface WeeklyChartDataOptions {
  data: ICDPWeek[] | undefined;
  unit?: string;
  defaultTab?: string;
  paletteDirection?: 'dsc' | 'asc';
}

const defaultPalette = {
  'asc': ['#FF5722', '#4CAF50'],
  'dsc': ['#4CAF50', '#FF5722']
};

const useWeeklyChartData = ({data, unit = '', defaultTab = '6 groups', paletteDirection = 'asc'}: WeeklyChartDataOptions) => {
  const {
    barTabs,
    globalBarTab,
    groupData,
    parseSingleBucketWeek,
    parseBucketGroupWeek
  } = useCDPUtils();

  const [currentTab, setCurrentTab] = useState(defaultTab);

  const palette = useMemo(() => {
    if (currentTab === barTabs[barTabs.length - 1]) {
      return gradientPalette(defaultPalette[paletteDirection][0], defaultPalette[paletteDirection][1], data?.length || 1);
    } else {
      return gradientPalette(defaultPalette[paletteDirection][0], defaultPalette[paletteDirection][1], barTabs.indexOf(currentTab) * 3 + 3);
    }
  }, [barTabs, currentTab, data?.length, paletteDirection])

  const chartData = useMemo(() => {
    if (!data?.length) {
      return [];
    }

    return data?.map((bucket) => {
      const name = `w${format(new Date(bucket.week), 'ww yyyy')}`
      const mappedData = {
        name
      } as { [key: PropertyKey]: string | number };

      let results;

      if (currentTab === barTabs[barTabs.length - 1]) {
        results = bucket.results.map((bucket, index) => parseSingleBucketWeek(bucket, index, data?.length, unit));
      } else {
        const groupedBuckets = groupData(bucket.results, barTabs.indexOf(currentTab) * 3 + 3);
        results = groupedBuckets.map((group, index) => parseBucketGroupWeek(group, index, groupedBuckets.length, unit));
      }

      Object.values(results).forEach((value, index) => {
        mappedData[`group${index}`] = value.value;
        mappedData[`group${index}Name`] = value.name;
      });
      return mappedData;
    })

  }, [data, currentTab, barTabs, parseSingleBucketWeek, unit, groupData, parseBucketGroupWeek]);

  const minValue = useMemo(() => {
    const dataKeys = uniq(chartData.flatMap(d => Object.values(d)).filter(val => !isNaN(+val))).map(item => +item);
    return Math.min(...dataKeys);
  }, [chartData]);

  useEffect(() => {
    setCurrentTab(globalBarTab);
  }, [globalBarTab]);

  return {
    chartData,
    currentTab,
    setCurrentTab,
    tabs: barTabs,
    minValue,
    palette
  };
};

export default useWeeklyChartData;
