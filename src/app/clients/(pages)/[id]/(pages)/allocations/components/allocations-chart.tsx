import {useMemo} from "react";
import {useClientDetails} from "@/app/clients/(pages)/[id]/components/client.provider";
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis
} from "recharts";
import {calculateDateFromHeight, convertBytesToIEC} from "@/lib/utils";
import {NameType, ValueType} from "recharts/types/component/DefaultTooltipContent";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";


const AllocationsChart = () => {

  const {allocationsData} = useClientDetails();

  const renderTooltip = (props: TooltipProps<ValueType, NameType>) => {
    const allocationData = props?.payload?.[0]?.payload;
    if (!allocationData) return null;

    return <Card>
      <CardHeader>
        <CardTitle>{calculateDateFromHeight(allocationData['height'])}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{`From: ${allocationData['verifierAddressId']}`}</p>
        <p>{`Allocated: ${convertBytesToIEC(allocationData['allowance'])}`}</p>
        <p>{`Total: ${convertBytesToIEC(allocationData['totalAllowance'])}`}</p>
      </CardContent>
    </Card>;
  };

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
    {chartData && <ResponsiveContainer width="100%" height="100%" aspect={2.7} debounce={500}>
      <ComposedChart
        width={500}
        height={400}
        data={chartData}
        margin={{
          top: 20,
          right: 20,
          bottom: 20,
          left: 20
        }}
      >
        <CartesianGrid stroke="#f5f5f5"/>
        <XAxis dataKey="height" tickFormatter={(value) => calculateDateFromHeight(value)}/>
        <YAxis tickFormatter={(value) => convertBytesToIEC(value)}/>
        <Tooltip content={renderTooltip}/>
        <Legend/>
        <Area type="monotone" dataKey="totalAllowance" fill="#8884d8" stroke="#8884d8"/>
        <Bar dataKey="allowance" barSize={50} fill="#413ea0"/>
      </ComposedChart>
    </ResponsiveContainer>}
  </div>
}

export {AllocationsChart}