"use client";
import {useStats} from "@/lib/hooks/dmob.hooks";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Cell, Pie, PieChart, ResponsiveContainer, Tooltip, TooltipProps} from "recharts";
import React, {memo, useMemo, useState} from "react";
import {convertBytesToIEC, palette} from "@/lib/utils";
import {ActiveShapeSimple} from "@/components/ui/pie-active-shape";
import {PieSectorDataItem} from "recharts/types/polar/Pie";
import {NameType, ValueType} from "recharts/types/component/DefaultTooltipContent";


const Component = () => {
  const {
    data, loading,
  } = useStats()

  const [chartDataParsing, setChartDataParsing] = useState(true);

  const renderTooltip = (props: TooltipProps<ValueType, NameType>) => {
    const payload = props?.payload?.[0]?.payload
    if (!payload) {
      return <></>
    }
    const {name, value} = payload;

    return (<Card key={props?.payload?.length}>
      <CardHeader className="flex flex-col items-start gap-1">
        <CardTitle>
          {name}
        </CardTitle>
        <CardTitle>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-start gap-1">
        {convertBytesToIEC(value)}
      </CardContent>
    </Card>);
  };

  const chartData = useMemo(() => {
    if (!data) {
      return undefined;
    }
    setChartDataParsing(true);

    const {totalDcGivenToAllocators, totalDcUsedByAllocators} = data;
    const usedDataCapNum = +totalDcUsedByAllocators;
    const availableDataCapNum = +totalDcGivenToAllocators - +totalDcUsedByAllocators;

    if (isNaN(usedDataCapNum) || isNaN(availableDataCapNum)) {
      return undefined;
    }

    setChartDataParsing(false);

    return [
      {name: 'Allocated', value: usedDataCapNum, percent: usedDataCapNum / +totalDcGivenToAllocators * 100},
      {name: 'Available', value: availableDataCapNum, percent: availableDataCapNum / +totalDcGivenToAllocators * 100}
    ];
  }, [data]);

  const isLoading = useMemo(() => {
    return loading || chartDataParsing;
  }, [loading, chartDataParsing]);

  const totalDc = useMemo(() => {
    if (!data) {
      return ['', ''];
    }

    return convertBytesToIEC(data?.totalDcGivenToAllocators).split(' ')
  }, [data]);

  return <Card>
    <CardHeader>
      <CardTitle>DataCap Allocation</CardTitle>
    </CardHeader>
    <CardContent className="flex flex-col md:flex-row lg:flex-col items-center justify-center relative">
      {
        !isLoading && !chartData && <p>Error loading data</p>
      }
      {chartData && <ResponsiveContainer width={'100%'} aspect={1} debounce={100}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            outerRadius={'70%'}
            innerRadius={'65%'}
            fill="#8884d8"
            dataKey="value"
            activeIndex={[0]}
            activeShape={(props: PieSectorDataItem) => ActiveShapeSimple(props, <div
              className="flex flex-col items-center justify-center w-[150px] h-[150px]">
              <div className="flex items-end gap-1">
                <p className="text-3xl">{totalDc[0]}</p>
                <p className="text-sm">{totalDc[1]}</p>
              </div>
              <p className="text-xs text-muted-foreground">Total DataCap</p>
            </div>)}
          >
            {chartData?.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={index === 0 ? palette(index) : '#E7E7E7'}/>
            ))}
          </Pie>
          <Tooltip content={renderTooltip}/>
        </PieChart>
      </ResponsiveContainer>}
      {chartData && <div className="w-full flex flex-col gap-4">
        <div className="flex items-start justify-between gap-2 w-full">
          <div className="flex gap-2 items-center">
            <div className="w-[10px] h-[10px] bg-dodger-blue rounded-full"/>
            <p className="text-sm">Used DataCap Allowance</p>
          </div>
          <div className="flex flex-col items-end">
            <p className="text-sm">{convertBytesToIEC(chartData[0].value)}</p>
            <p className="text-xs text-muted-foreground">{chartData[0].percent.toFixed(2)}%</p>
          </div>
        </div>
        <div className="flex items-start justify-between gap-2 w-full">
          <div className="flex gap-2 items-center">
            <div className="w-[10px] h-[10px] bg-[#E7E7E7] rounded-full"/>
            <p className="text-sm">Remaining DataCap Allowance</p>
          </div>
          <div className="flex flex-col items-end">
            <p className="text-sm">{convertBytesToIEC(chartData[1].value)}</p>
            <p className="text-xs text-muted-foreground">{chartData[1].percent.toFixed(2)}%</p>
          </div>
        </div>
      </div>}
    </CardContent>
  </Card>
}

const DatacapAllocationChart = memo(Component);

export {DatacapAllocationChart}