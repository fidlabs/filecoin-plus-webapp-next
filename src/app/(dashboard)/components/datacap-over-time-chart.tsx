"use client";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import {memo, useCallback, useMemo, MouseEvent, useState} from "react";
import {cn, convertBytesToIEC, palette} from "@/lib/utils";
import {useChartScale} from "@/lib/hooks/useChartScale";
import {ScaleSelector} from "@/components/ui/scale-selector";
import {IAllocatorsResponse} from "@/lib/interfaces/dmob/allocator.interface";
import {IFilDCAllocationsWeeklyByClient} from "@/lib/interfaces/dmob/dmob.interface";
import {useDataCapOverTimeChart} from "@/app/(dashboard)/hooks/useDataCapOverTimeChart";
import {Tabs, TabsList, TabsTrigger} from "@/components/ui/tabs";

interface Props {
  data: IFilDCAllocationsWeeklyByClient,
  allocators: IAllocatorsResponse
}

const Component = ({data, allocators}: Props) => {

  const [mode, setMode] = useState<'week' | 'allocator'>('allocator')

  const {
    valueKeys,
    valuesToDisplay,
    selectedValues,
    setSelectedValues,
    reversedValueKeys,
    renderTooltip,
    chartData,
    minValue
  } = useDataCapOverTimeChart(mode, data, allocators);

  const formatYAxisTick = (value: string) => {
    return convertBytesToIEC(value);
  };

  const handleClick = (data: {
    name: string;
    [key: string]: number | string;
  }) => {
    window.open(`/allocators/${data.name}`, '_blank');
  };

  const {scale, selectedScale, setSelectedScale} = useChartScale(minValue, 'linear');

  const clickLegend = useCallback((event: MouseEvent<HTMLButtonElement>, entry: string) => {
    const isMac = navigator.userAgent.includes('Mac');
    if (event.shiftKey) {
      if (!selectedValues.length) {
        setSelectedValues([entry]);
      } else {
        const firstIndex = valueKeys.indexOf(selectedValues[0]);
        const lastIndex = valueKeys.indexOf(selectedValues[selectedValues.length - 1]);
        const selectedIndex = valueKeys.indexOf(entry);
        const start = Math.min(firstIndex, selectedIndex, selectedValues.indexOf(entry) > -1 ? selectedIndex : lastIndex);
        const end = Math.max(firstIndex, selectedIndex, selectedValues.indexOf(entry) > -1 ? selectedIndex : lastIndex);
        setSelectedValues(valueKeys.slice(start, end + 1));
      }
    } else if ((!isMac && event.ctrlKey) || (isMac && event.metaKey)) {
      setSelectedValues(curr => curr.indexOf(entry) > -1 ? curr.filter((item) => item !== entry) : [...curr, entry]);
    } else {
      setSelectedValues(curr => curr.length === 1 && curr.indexOf(entry) > -1 ? curr.filter((item) => item !== entry) : [entry]);
    }
  }, [selectedValues, setSelectedValues, valueKeys]);

  const renderLegend = useCallback(() => {
    return (
      <div className={cn("flex flex-col m-2 gap-x-1 h-full", mode === 'allocator' && 'flex-wrap')}>
        {
          reversedValueKeys.map((entry, index) => {
            const name = mode === 'allocator' ? allocators.data.find((allocator) => allocator.addressId === entry)?.name ?? entry : `Week ${entry.substring(1)}`
            return <button
              className={cn("bg-transparent text-xs flex items-center rounded-md h-6 p-1 hover:grayscale-0 hover:opacity-100 hover:bg-solitude",
                {["grayscale-[80%] opacity-60"]: !!selectedValues.length},
                {["!bg-oyster-bay grayscale-0 opacity-100 active"]: selectedValues.indexOf(entry) > -1})}
              onClick={(e) => clickLegend(e, entry)} key={`item-${index}`}>
              <div className={"w-5 h-full mr-1 rounded"} style={{backgroundColor: palette(valueKeys.indexOf(entry))}}/>
              {name.length > 20 ? name.substring(0, 20) + '...' : name}
            </button>
          })
        }
        <div className="grid mt-1">
          <button
            className="bg-transparent text-sm flex items-center rounded-md h-6 p-1 hover:bg-solitude justify-center"
            onClick={() => {
              setSelectedValues([]);
            }}>
            Clear
          </button>
        </div>
      </div>
    );
  }, [reversedValueKeys, allocators.data, selectedValues, valueKeys, clickLegend, setSelectedValues]);

  const filteredData = useMemo(() => {
    return chartData.filter((item) => valuesToDisplay.some((key) => Object.keys(item).includes(key)));
  }, [chartData, valuesToDisplay]);

  return <Card className="hidden lg:block lg:col-span-3">
    <CardHeader>
      <CardTitle>DataCap Used Over Time by Allocator</CardTitle>
      <div className="flex gap-2">
        <Tabs value={mode} onValueChange={(val) => setMode(val as 'week' | 'allocator')}>
          <TabsList>
            <TabsTrigger value="week">Week based</TabsTrigger>
            <TabsTrigger value="allocator">Allocator based</TabsTrigger>
          </TabsList>
        </Tabs>
        <ScaleSelector scale={selectedScale} setScale={setSelectedScale}/>
      </div>
    </CardHeader>
    <CardContent className="flex items-center justify-center">
      {
        !chartData && <p>Error loading data</p>
      }
      {!!chartData?.length && !!filteredData?.length &&
        <ResponsiveContainer width="100%" aspect={3 / 2} debounce={500}>
          <BarChart
            data={filteredData}
            margin={{top: 40, right: 10, left: 10, bottom: 100}}
          >
            <CartesianGrid strokeDasharray="3 3"/>
            {mode === 'week' && <XAxis dataKey="display" angle={90} interval={0} minTickGap={0} tick={<CustomizedAxisTick/>}/>}
            {mode === 'allocator' && <XAxis dataKey="name" angle={90} interval={0} minTickGap={0} tick={<CustomizedAxisTick/>}/>}
            <YAxis tickFormatter={formatYAxisTick} scale={scale}/>
            <Tooltip content={renderTooltip}/>
            <Legend align="right" verticalAlign="middle" layout="vertical" width={mode === 'allocator' ? 400 : 200} height={mode === 'allocator' ? 900 : undefined} content={renderLegend}/>
            {valuesToDisplay.map((key) => <Bar onClick={handleClick} key={key} style={{cursor: 'pointer'}} dataKey={key}
                                              stackId="a" fill={palette(valueKeys.indexOf(key))}/>)}
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