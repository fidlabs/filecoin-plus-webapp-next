import { IFilDCAllocationsWeeklyByClient } from "@/lib/interfaces/dmob/dmob.interface";
import {
  IAllocator,
  IAllocatorsResponse,
} from "@/lib/interfaces/dmob/allocator.interface";
import { useCallback, useMemo, useState } from "react";
import { TooltipProps } from "recharts";
import {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { convertBytesToIEC, palette } from "@/lib/utils";
import { uniq } from "lodash";

type DataCapOverTimeChartMode = "week" | "allocator";

export const useDataCapOverTimeChart = (
  mode: DataCapOverTimeChartMode,
  data: IFilDCAllocationsWeeklyByClient,
  allocators: IAllocatorsResponse
) => {
  const [valueKeys, setValueKeys] = useState<string[]>([]);
  const [selectedValues, setSelectedValues] = useState<string[]>([]);

  const reversedValueKeys = useMemo(
    () => valueKeys.slice().reverse(),
    [valueKeys]
  );

  const valuesToDisplay = useMemo(() => {
    if (!selectedValues?.length) {
      return valueKeys;
    }
    return valueKeys.filter((key) => selectedValues.indexOf(key) > -1);
  }, [selectedValues, valueKeys]);

  const renderTooltip = useCallback(
    (props: TooltipProps<ValueType, NameType>) => {
      const providerData = props?.payload?.[0]?.payload;
      if (!providerData) return null;

      const total = valuesToDisplay.reduce(
        (acc, key) =>
          (isNaN(+providerData[key]) ? 0 : +providerData[key]) + acc,
        0
      );

      return (
        <Card>
          <CardHeader>
            <CardTitle>
              {mode === "week" ? providerData["display"] : providerData["name"]}{" "}
              - {convertBytesToIEC(total)}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {reversedValueKeys
              .filter((key) => valuesToDisplay.includes(key))
              .map((key, index) => {
                if (providerData[key]) {
                  return (
                    <div
                      key={index}
                      className="flex flex-row items-center justify-start gap-1 text-sm text-muted-foreground"
                    >
                      <div
                        className="w-[10px] h-[10px] rounded-full"
                        style={{
                          backgroundColor: palette(valueKeys.indexOf(key)),
                        }}
                      />
                      {mode === "week" && (
                        <p className="leading-none">
                          {`${key}: ${convertBytesToIEC(providerData[key])}`}
                        </p>
                      )}

                      {mode === "allocator" && (
                        <p className="leading-none">
                          {`${allocators.data.find((notary) => notary.addressId === key)?.name || key}: ${convertBytesToIEC(providerData[key])}`}
                        </p>
                      )}
                    </div>
                  );
                }
              })}
          </CardContent>
        </Card>
      );
    },
    [valuesToDisplay, mode, reversedValueKeys, valueKeys, allocators.data]
  );

  const parseDataAllocator = useCallback(() => {
    const normalData: {
      name: string;
      [key: string]: number | string;
    }[] = [];

    if (data) {
      setValueKeys([]);
      Object.keys(data).forEach((yearKey) => {
        const yearObj = data[yearKey];
        Object.keys(yearObj).forEach((weekKey) => {
          const weekObj = yearObj[weekKey];
          normalData.push({
            name: `w${weekKey} '${yearKey.substr(2)}`,
            ...weekObj,
          });
          setValueKeys((keys) => {
            return uniq([...keys, ...Object.keys(weekObj)]);
          });
        });
      });
    }
    return normalData;
  }, [data]);

  const getAllocatorName = (allocator: IAllocator | undefined) => {
    if (!!allocator?.orgName?.length) {
      return `${allocator?.orgName?.substring(0, 15)}${allocator?.orgName?.length > 15 ? "..." : ""}`;
    } else if (!!allocator?.name?.length) {
      return `${allocator?.name?.substring(0, 15)}${allocator?.name?.length > 15 ? "..." : ""}`;
    } else {
      return undefined;
    }
  };

  const parseDataWeek = useCallback(() => {
    let normalData: {
      name: string;
      display: string;
      [key: string]: number | string;
    }[] = [];

    if (data && !!allocators?.data) {
      setValueKeys([]);
      Object.keys(data).forEach((yearKey) => {
        const yearObj = data[yearKey];
        Object.keys(yearObj).forEach((weekKey) => {
          const weekObj = yearObj[weekKey];
          setValueKeys((keys) => {
            return [...keys, `w${weekKey}`];
          });
          Object.keys(weekObj).forEach((clientKey) => {
            const clientObj = weekObj[clientKey];
            const display = getAllocatorName(
              allocators.data.find((notary) => notary.addressId === clientKey)
            );
            if (
              normalData.findIndex((item) => item.name === clientKey) === -1
            ) {
              normalData.push({
                name: clientKey,
                display: display ?? clientKey,
                [`w${weekKey}`]: +clientObj,
              });
            } else {
              normalData = normalData.map((item) => {
                if (item.name === clientKey) {
                  return {
                    ...item,
                    [`w${weekKey}`]: +clientObj,
                  };
                }
                return item;
              });
            }
          });
        });
      });
    }

    return normalData;
  }, [allocators.data, data]);

  const chartData = useMemo(() => {
    if (mode === "week") {
      return parseDataWeek();
    }
    return parseDataAllocator();
  }, [mode, parseDataAllocator, parseDataWeek]);

  const minValue = useMemo(() => {
    if (!chartData.length) {
      return 0;
    }
    const values = chartData
      .map((item) => valuesToDisplay.map((week) => +item[week]))
      .flat()
      .filter((item) => !isNaN(+item));

    return Math.min(...values);
  }, [chartData, valuesToDisplay]);

  return {
    valueKeys,
    setValueKeys,
    selectedValues,
    setSelectedValues,
    reversedValueKeys,
    valuesToDisplay,
    renderTooltip,
    chartData,
    minValue,
  };
};
