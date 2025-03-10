import { barTabs, useCDPUtils } from "@/lib/providers/cdp.provider";
import { useLayoutEffect, useMemo, useState } from "react";
import {format, getWeek} from "date-fns";
import { uniq } from "lodash";
import { ICDPWeek } from "@/lib/interfaces/cdp/cdp.interface";
import { gradientPalette } from "@/lib/utils";

interface WeeklyChartDataOptions {
  data: ICDPWeek[] | undefined;
  unit?: string;
  defaultTab?: string;
  paletteDirection?: "dsc" | "asc";
  usePercentage?: boolean;
}

const defaultPalette = {
  asc: ["#FF5722", "#4CAF50"],
  dsc: ["#4CAF50", "#FF5722"],
};

const useWeeklyChartData = ({
  data,
  unit = "",
  defaultTab = "6 groups",
  paletteDirection = "asc",
  usePercentage,
}: WeeklyChartDataOptions) => {
  const { groupData, parseSingleBucketWeek, parseBucketGroupWeek } =
    useCDPUtils();

  const [currentTab, setCurrentTab] = useState(defaultTab);
  const [currentDataTab, setCurrentDataTab] = useState("PiB");

  useLayoutEffect(() => {
    const cacheTab = localStorage.getItem("complianceDataPortalChartTab");
    const cacheDataTab = localStorage.getItem(
      "complianceDataPortalChartDataTab"
    );
    if (cacheTab) {
      setCurrentTab(cacheTab);
    }
    if (cacheDataTab) {
      setCurrentDataTab(cacheDataTab);
    }
  }, []);

  const setCurrentTabCache = (tab: string) => {
    setCurrentTab(tab);
    localStorage.setItem("complianceDataPortalChartTab", tab);
  };

  const setCurrentDataTabCache = (tab: string) => {
    setCurrentDataTab(tab);
    localStorage.setItem("complianceDataPortalChartDataTab", tab);
  };

  const palette = useMemo(() => {
    if (currentTab === barTabs[barTabs.length - 1]) {
      const length = Math.max(
        ...(data?.map((bucket) => bucket.results.length) || [0])
      );
      return gradientPalette(
        defaultPalette[paletteDirection][0],
        defaultPalette[paletteDirection][1],
        length
      );
    } else {
      return gradientPalette(
        defaultPalette[paletteDirection][0],
        defaultPalette[paletteDirection][1],
        barTabs.indexOf(currentTab) * 3 + 3
      );
    }
  }, [currentTab, data, paletteDirection]);

  const chartData = useMemo(() => {
    if (!data?.length) {
      return [];
    }

    return data?.map((bucket) => {
      const date = new Date(bucket.week);
      let name = `w${getWeek(date)} '${date.getFullYear().toString().substring(2, 4)}`;

      if (+format(new Date(bucket.week), "ww") === 1) {
        name = `w${getWeek(date)} '${date.getFullYear().toString().substring(2, 4)}`;
      }

      const mappedData = {
        name,
      } as { [key: PropertyKey]: string | number };

      if (bucket.averageSuccessRate) {
        mappedData["avgSuccessRate"] = bucket.averageSuccessRate;
      }

      let results;

      const modifier = (val: number) => {
        const total =
          currentDataTab === "Count"
            ? bucket.total
            : bucket.results.reduce((acc, curr) => acc + +curr.totalDatacap, 0);

        return usePercentage ? (val / total) * 100 : val;
      };

      if (currentTab === barTabs[barTabs.length - 1]) {
        results = bucket.results.map((bucket, index) =>
          parseSingleBucketWeek(
            bucket,
            index,
            data?.length,
            unit,
            currentDataTab
          )
        );
      } else {
        const groupedBuckets = groupData(
          bucket.results,
          barTabs.indexOf(currentTab) * 3 + 3
        );
        results = groupedBuckets.map((group, index) =>
          parseBucketGroupWeek(
            group,
            index,
            groupedBuckets.length,
            unit,
            currentDataTab
          )
        );
      }

      Object.values(results).forEach((value, index) => {
        mappedData[`group${index}`] = modifier(value.value);
        mappedData[`group${index}Name`] = value.name;
      });
      return mappedData;
    });
  }, [
    data,
    currentTab,
    currentDataTab,
    parseSingleBucketWeek,
    unit,
    groupData,
    parseBucketGroupWeek,
    usePercentage,
  ]);

  const minValue = useMemo(() => {
    const dataKeys = uniq(
      chartData.flatMap((d) => Object.values(d)).filter((val) => !isNaN(+val))
    ).map((item) => +item);
    return Math.min(...dataKeys);
  }, [chartData]);

  return {
    chartData,
    currentTab,
    setCurrentTab: setCurrentTabCache,
    currentDataTab,
    setCurrentDataTab: setCurrentDataTabCache,
    minValue,
    palette,
  };
};

export default useWeeklyChartData;
