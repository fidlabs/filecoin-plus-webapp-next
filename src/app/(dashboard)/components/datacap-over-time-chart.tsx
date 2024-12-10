"use client";
import {useDataCapAllocationsWeeklyByClient, useAllAllocators} from "@/lib/hooks/dmob.hooks";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip, TooltipProps,
  XAxis,
  YAxis
} from "recharts";
import React, {memo, useCallback, useMemo, useState} from "react";
import {cn, convertBytesToIEC, palette} from "@/lib/utils";
import {NameType, ValueType} from "recharts/types/component/DefaultTooltipContent";
import {useChartScale} from "@/lib/hooks/useChartScale";
import {ScaleSelector} from "@/components/ui/scale-selector";
import {IAllocatorsResponse} from "@/lib/interfaces/dmob/allocator.interface";


const Component = () => {
  const {data, loading} = useDataCapAllocationsWeeklyByClient();
  const {data: allocatorsData} = useAllAllocators();

  const [weeksKeys, setWeeksKeys] = useState<string[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<string[]>([]);

  const reversedWeekKeys = useMemo(() => weeksKeys.slice().reverse(), [weeksKeys]);

  const weeksToDisplay = useMemo(() => {
    if (!selectedWeek?.length) {
      return weeksKeys;
    }
    return weeksKeys.filter((key) => selectedWeek.indexOf(key) > -1);
  }, [selectedWeek, weeksKeys]);

  const formatYAxisTick = (value: string) => {
    return convertBytesToIEC(value);
  };

  const renderTooltip = (props: TooltipProps<ValueType, NameType>) => {
    const providerData = props?.payload?.[0]?.payload;
    if (!providerData) return null;

    const total = weeksToDisplay.reduce((acc, key) => (isNaN(+providerData[key]) ? 0 : +providerData[key]) + acc, 0);

    return <Card>
      <CardHeader>
        <CardTitle>{providerData['display']} - {convertBytesToIEC(total)}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {reversedWeekKeys.filter(key => weeksToDisplay.includes(key)).map((key, index) => {
          if (providerData[key]) {
            return <div
              key={index}
              className="flex flex-row items-center justify-start gap-1 text-sm text-muted-foreground"
            >
              <div className="w-[10px] h-[10px] rounded-full" style={{
                backgroundColor: palette(
                  weeksKeys.indexOf(key)
                )
              }}/>
              <p className="leading-none">
                {`${key}: ${convertBytesToIEC(providerData[key])}`}
              </p>
            </div>
          }
        })}
      </CardContent>
    </Card>;
  };

  const chartData = useMemo(() => {
    let normalData: {
      name: string;
      display: string;
      [key: string]: number | string;
    }[] = [];

    if (data && !!allocatorsData?.data) {
      setWeeksKeys([]);
      Object.keys(data).forEach((yearKey) => {
        const yearObj = data[yearKey];
        Object.keys(yearObj).forEach((weekKey) => {
          const weekObj = yearObj[weekKey];
          setWeeksKeys(keys => {
            return [
              ...keys,
              `w${weekKey}`
            ];
          });
          Object.keys(weekObj).forEach((clientKey) => {
            const clientObj = weekObj[clientKey];
            if (normalData.findIndex((item) => item.name === clientKey) === -1) {
              normalData.push({
                name: clientKey,
                display: (allocatorsData as IAllocatorsResponse).data.find((notary) => notary.addressId === clientKey)?.name || clientKey,
                [`w${weekKey}`]: +clientObj
              });
            } else {
              normalData = normalData.map((item) => {
                if (item.name === clientKey) {
                  return {
                    ...item,
                    [`w${weekKey}`]: +clientObj
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
  }, [data, allocatorsData])

  const handleClick = (data: {
    name: string;
    [key: string]: number | string;
  }) => {
    window.open(`/allocators/${data.name}`, '_blank');
  };

  const minValue = useMemo(() => {
    if (!chartData.length) {
      return 0;
    }
    const values = chartData.map((item) => weeksToDisplay.map(week => +item[week])).flat().filter((item) => !isNaN(+item));

    return Math.min(...values);
  }, [chartData, weeksToDisplay]);

  const {scale, selectedScale, setSelectedScale} = useChartScale(minValue, 'log');

  const clickLegend = useCallback((event: React.MouseEvent<HTMLButtonElement>, entry: string) => {
    const isMac = navigator.userAgent.includes('Mac');
    if (event.shiftKey) {
      if (!selectedWeek.length) {
        setSelectedWeek([entry]);
      } else {
        const firstIndex = weeksKeys.indexOf(selectedWeek[0]);
        const lastIndex = weeksKeys.indexOf(selectedWeek[selectedWeek.length - 1]);
        const selectedIndex = weeksKeys.indexOf(entry);
        const start = Math.min(firstIndex, selectedIndex, selectedWeek.indexOf(entry) > -1 ? selectedIndex : lastIndex);
        const end = Math.max(firstIndex, selectedIndex, selectedWeek.indexOf(entry) > -1 ? selectedIndex : lastIndex);
        setSelectedWeek(weeksKeys.slice(start, end + 1));
      }
    } else if ((!isMac && event.ctrlKey) || (isMac && event.metaKey)) {
      setSelectedWeek(curr => curr.indexOf(entry) > -1 ? curr.filter((item) => item !== entry) : [...curr, entry]);
    } else {
      setSelectedWeek(curr => curr.length === 1 && curr.indexOf(entry) > -1 ? curr.filter((item) => item !== entry) : [entry]);
    }
  }, [selectedWeek, weeksKeys]);

  const renderLegend = useCallback(() => {
    return (
      <div className="flex flex-col m-2">
        {
          reversedWeekKeys.map((entry, index) => (
            <button
              className={cn("bg-transparent text-sm flex items-center rounded-md h-6 p-1 hover:grayscale-0 hover:opacity-100 hover:bg-solitude",
                {["grayscale-[80%] opacity-60"]: !!selectedWeek.length},
                {["!bg-oyster-bay grayscale-0 opacity-100 active"]: selectedWeek.indexOf(entry) > -1})}
              onClick={(e) => clickLegend(e, entry)} key={`item-${index}`}>
              <div className={"w-5 h-full mr-1 rounded"} style={{backgroundColor: palette(weeksKeys.indexOf(entry))}}/>
              Week {entry.substring(1)}
            </button>
          ))
        }
        <div className="grid mt-1">
          <button
            className="bg-transparent text-sm flex items-center rounded-md h-6 p-1 hover:bg-solitude justify-center"
            onClick={() => {
              setSelectedWeek([]);
            }}>
            Clear
          </button>
        </div>
      </div>
    );
  }, [clickLegend, reversedWeekKeys, selectedWeek, weeksKeys]);

  const filteredData = useMemo(() => {
    return chartData.filter((item) => weeksToDisplay.some((key) => Object.keys(item).includes(key)));
  }, [chartData, weeksToDisplay]);

  return <Card className="hidden lg:block lg:col-span-3">
    <CardHeader>
      <CardTitle>DataCap Used Over Time by Allocator</CardTitle>
      <ScaleSelector scale={selectedScale} setScale={setSelectedScale}/>
    </CardHeader>
    <CardContent className="flex items-center justify-center">
      {
        !loading && !chartData && <p>Error loading data</p>
      }
      {!loading && !!chartData?.length && !!filteredData?.length && <ResponsiveContainer width="100%" aspect={3 / 2} debounce={500}>
        <BarChart
          data={filteredData}
          margin={{top: 40, right: 50, left: 20, bottom: 200}}
        >
          <CartesianGrid strokeDasharray="3 3"/>
          <XAxis dataKey="display" angle={90} interval={0} minTickGap={0} tick={<CustomizedAxisTick/>}/>
          <YAxis tickFormatter={formatYAxisTick} scale={scale}/>
          <Tooltip content={renderTooltip}/>
          <Legend align="right" verticalAlign="middle" layout="vertical" content={renderLegend}/>
          {weeksToDisplay.map((key) => <Bar onClick={handleClick} key={key} style={{cursor: 'pointer'}} dataKey={key}
                                            stackId="a" fill={palette(weeksKeys.indexOf(key))}/>)}
        </BarChart>
      </ResponsiveContainer>}
    </CardContent>
  </Card>
}

const CustomizedAxisTick = (props: {
  x?: number,
  y?: number,
  stroke?: string,
  payload?: { value: string }
}) => {
  const {
    x, y, payload = {
      value: ''
    }
  } = props;
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dx={-5} dy={5} textAnchor="end" fill="#666" transform="rotate(-90)">
        {payload.value.substring(0, 25)}{payload.value.length > 25 ? '...' : ''}
      </text>
    </g>
  );
};

const DataCapOverTimeChart = memo(Component);

export {DataCapOverTimeChart}