"use client";

import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
} from "react";
import { ICDPRange } from "@/lib/interfaces/cdp/cdp.interface";

export const barTabs = ["3 groups", "6 groups", "All"];
export const dataTabs = ["PiB", "Count"];
export const scaleTabs = ["Linear scale", "Log scale"];

const CommonChartContext = createContext({
  groupData: (data: ICDPRange[], groupCount: number) => {
    console.log(data, groupCount);
    return [] as ICDPRange[][];
  },
  parseSingleBucketWeek: (
    bucket: ICDPRange,
    index: number,
    length: number,
    unit: string,
    dataMode: string
  ) => {
    console.log(bucket, index, length, unit, dataMode);
    return {
      name: "",
      value: 0,
    };
  },
  parseBucketGroupWeek: (
    group: ICDPRange[],
    index: number,
    length: number,
    unit: string,
    dataMode: string
  ) => {
    console.log(group, index, length, unit, dataMode);
    return {
      name: "",
      value: 0,
    };
  },
});

const CdpProvider = ({ children }: PropsWithChildren) => {
  const groupData = useCallback((data: ICDPRange[], groupCount: number) => {
    if (!data || !data.length || !groupCount) {
      return [];
    }

    const groupedData = [];
    const size = Math.ceil(data.length / groupCount);

    for (let i = 0; i < data.length; i += size) {
      groupedData.push(data.slice(i, i + size));
    }
    return groupedData;
  }, []);

  const parseSingleBucketWeek = useCallback(
    (
      bucket: ICDPRange,
      index: number,
      length: number,
      unit = "",
      dataMode = "PiB"
    ) => {
      let name = `${bucket.valueFromExclusive + 1} - ${
        bucket.valueToInclusive
      }${unit}`;
      if (bucket.valueToInclusive - bucket.valueFromExclusive <= 1) {
        const unitWithoutS = unit.slice(0, -1);
        name = `${bucket.valueToInclusive}${
          bucket.valueToInclusive === 1 ? unitWithoutS : unit
        }`;
      } else if (index === 0) {
        const unitWithoutS = unit.slice(0, -1);
        name = `${bucket.valueFromExclusive < 0 ? "" : "Less than "}${
          bucket.valueToInclusive
        }${bucket.valueToInclusive === 1 ? unitWithoutS : unit}`;
      } else if (index === length - 1) {
        name = `Over ${bucket.valueFromExclusive}${unit}`;
      }
      return {
        name,
        value: dataMode === "PiB" ? bucket.totalDatacap : bucket.count,
      };
    },
    []
  );

  const parseBucketGroupWeek = useCallback(
    (
      group: ICDPRange[],
      index: number,
      length: number,
      unit = "",
      dataMode = "PiB"
    ) => {
      let name = `${group[0].valueFromExclusive + 1} - ${
        group[group.length - 1].valueToInclusive
      }${unit}`;
      if (index === 0) {
        name = `Less than ${group[group.length - 1].valueToInclusive}${unit}`;
      } else if (index === length - 1) {
        name = `Over ${group[0].valueFromExclusive}${unit}`;
      }
      return {
        name,
        value: group.reduce(
          (acc, bucket) =>
            acc + (dataMode === "PiB" ? +bucket.totalDatacap : bucket.count),
          0
        ),
      };
    },
    []
  );

  return (
    <CommonChartContext.Provider
      value={{
        groupData,
        parseSingleBucketWeek,
        parseBucketGroupWeek,
      }}
    >
      {children}
    </CommonChartContext.Provider>
  );
};

const useCDPUtils = () => {
  return useContext(CommonChartContext);
};

export { CdpProvider, useCDPUtils };
