"use client";
import {useMemo} from "react";
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis
} from "recharts";
import {calculateDateFromHeight, convertBytesToIEC, palette} from "@/lib/utils";
import {NameType, ValueType} from "recharts/types/component/DefaultTooltipContent";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {IClientAllocationsResponse} from "@/lib/interfaces/dmob/client.interface";
import {useMediaQuery} from "usehooks-ts";

interface IProps {
  allocationsData: IClientAllocationsResponse
}

const AllocationsChart = ({allocationsData}: IProps) => {

  const renderTooltip = (props: TooltipProps<ValueType, NameType>) => {
    const allocationData = props?.payload?.[0]?.payload;
    if (!allocationData) return null;

    return <Card>
      <CardHeader>
        <CardTitle>{calculateDateFromHeight(allocationData['height'])}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{`From: ${allocationData['verifierAddressId']}`}</p>
        <p style={{color: palette(0)}}>{`Allocated: ${convertBytesToIEC(allocationData['allowance'])}`}</p>
        <p style={{color: palette(64)}}>{`Total: ${convertBytesToIEC(allocationData['totalAllowance'])}`}</p>
      </CardContent>
    </Card>;
  };

  const isDesktop = useMediaQuery("(min-width: 768px)");

  const chartData = useMemo(() => {

    if (!allocationsData?.data) {
      return [];
    }

    const returnData: {
      verifierAddressId: string,
      allowance: number,
      height: number,
      auditTrail: string,
      totalAllowance: number
    }[] = [];

    const flatAllowanceArray = allocationsData?.data?.flatMap((item) => item.allowanceArray);

    flatAllowanceArray.sort((a, b) => +a.height - +b.height).forEach((item) => {
      returnData.push({
        verifierAddressId: item.verifierAddressId,
        allowance: +item.allowance,
        height: item.height,
        auditTrail: item.auditTrail,
        totalAllowance: returnData.reduce((acc, cur) => acc + +cur.allowance, 0) + +item.allowance
      });
    });

    return returnData;

  }, [allocationsData]);

  return <div className="lg:max-h-[50vh] overflow-y-auto overflow-x-hidden">
    {chartData && <ResponsiveContainer width="100%" height="100%" aspect={isDesktop ? 2.7 : 1} debounce={500}>
      <ComposedChart
        width={500}
        height={400}
        data={chartData}
        layout={!isDesktop ? "vertical" : "horizontal"}
        margin={{
          top: 20,
          right: 20,
          bottom: 20,
          left: 20
        }}
      >
        <CartesianGrid stroke="#f5f5f5"/>
        {isDesktop && <XAxis dataKey="height" tickFormatter={(value) => calculateDateFromHeight(value)}/>}
        {isDesktop && <YAxis tickFormatter={(value) => convertBytesToIEC(value)}/>}
        {!isDesktop && <YAxis dataKey="height" type="category" tickFormatter={(value) => calculateDateFromHeight(value)}/>}
        {!isDesktop && <XAxis type="number" tickFormatter={(value) => convertBytesToIEC(value)}/>}
        <Tooltip content={renderTooltip}/>
        <Area type="monotone" dataKey="totalAllowance"
              stroke={palette(64)}
              fill={palette(64)}/>
        <Bar dataKey="allowance" barSize={50} fill={palette(0)}/>
      </ComposedChart>
    </ResponsiveContainer>}
  </div>
}

export {AllocationsChart}