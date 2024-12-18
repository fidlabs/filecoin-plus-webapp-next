import {IAllocatorWithSheetInfo} from "@/lib/interfaces/cdp/google.interface";
import {useGoogleSheetFilters} from "@/lib/hooks/google.hooks";
import {useMemo} from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis
} from "recharts";
import {NameType, ValueType} from "recharts/types/component/DefaultTooltipContent";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {ChartLoader} from "@/components/ui/chart-loader";

interface AuditHistoryBarGraphProps {
  data: IAllocatorWithSheetInfo[];
  isLoading: boolean;
  audits: number;
  showActive: boolean;
  showAudited: boolean;
  hideWaiting: boolean;
}

const AuditHistoryBarGraph = ({data, isLoading, audits, showAudited, showActive, hideWaiting}: AuditHistoryBarGraphProps) => {

  const {
    activeFilter, auditedFilter, FAILED_STATUSES, WAITING_STATUSES, PARTIAL_STATUSES, PASS_STATUSES
  } = useGoogleSheetFilters();

  const getStatusFriendlyName = (status: string) => {

    if (FAILED_STATUSES.includes(status)) {
      return 'Failed';
    }
    if (PARTIAL_STATUSES.includes(status)) {
      return 'Passed conditionally';
    }
    if (PASS_STATUSES.includes(status)) {
      return 'Passed';
    }
    return 'Pre audit';
  };

  const getStatusColor = (status: string) => {
    if (FAILED_STATUSES.includes(status)) {
      return '#ff0029';
    }
    if (PARTIAL_STATUSES.includes(status)) {
      return '#f2b94f';
    }
    if (PASS_STATUSES.includes(status)) {
      return '#66a61e';
    }
    return '#525252';
  };

  const getOrdinalNumber = (number: number) => {
    const j = number % 10,
      k = number % 100;
    if (j === 1 && k !== 11) {
      return number + 'st';
    }
    if (j === 2 && k !== 12) {
      return number + 'nd';
    }
    if (j === 3 && k !== 13) {
      return number + 'rd';
    }
    return number + 'th';
  };

  const renderTooltip = (props: TooltipProps<ValueType, NameType>) => {
    const payload = props?.payload?.[0]?.payload;

    const dataKeysReversed = [...dataKeys].reverse();

    if (!payload) {
      return null;
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>{payload.name}</CardTitle>
        </CardHeader>
        <CardContent>{
          dataKeysReversed.map((key) => {
            const value = payload[key];
            if (!value || (hideWaiting && WAITING_STATUSES.includes(payload[`${key}Name`])) || payload[`${key}Name`] === 'INACTIVE') {
              return null;
            }
            return <div key={key} className="chartTooltipRow">
              <div>{getOrdinalNumber(+key.substring(1) + 1)} Audit - <span style={{color: getStatusColor(payload[`${key}Name`])}}>
                {getStatusFriendlyName(payload[`${key}Name`])} {!FAILED_STATUSES.includes(payload[`${key}Name`].toUpperCase()) && <span>({payload[key]} PiB)</span>}
              </span>
              </div>
            </div>;
          })
        }</CardContent>
      </Card>
    );
  };

  const maxValue = useMemo(() => {
    const filteredData = data.filter((item) => (!showActive || activeFilter(item)) && (!showAudited || auditedFilter(item)));

    return Math.max(...filteredData.map((item) => {
      return item.auditSizes.reduce((acc, size) => {
        return acc + size;
      }, 0);
    }));
  }, [activeFilter, auditedFilter, data, showActive, showAudited])

  const chartData = useMemo(() => {
    const returnData = [] as { [key: PropertyKey]: string | number }[];

    const filteredData = data.filter((item) => (!showActive || activeFilter(item)) && (!showAudited || auditedFilter(item)));

    filteredData.forEach((item) => {
      const chart = {
        name: item.name
      } as { [key: PropertyKey]: string | number }

      item.auditStatuses.forEach((status, index) => {
        if (index > 0 && hideWaiting && WAITING_STATUSES.includes(status) || status === 'INACTIVE') {
          return;
        }

        const key = `a${index}`;
        chart[key] = item.auditSizes[index] ?? 5;
        chart[`${key}Name`] = status;
      });

      returnData.push(
        chart
      );
    });
    return returnData;
  }, [WAITING_STATUSES, activeFilter, auditedFilter, data, showActive, showAudited, hideWaiting]);

  const dataKeys = useMemo(() => {
    return Array.from({length: audits}, (_, i) => `a${i}`);
  }, [audits]);

  const renderLegend = () => {
    return (
      <div className="flex flex-col m-2 gap-1">
        <div
          className="text-sm leading-none flex items-center h-[25px] gap-1">
          <div className="w-[20px] h-[15px] rounded-[4px]" style={{backgroundColor: getStatusColor('DOUBLE')}}/>
          Passed
        </div>
        <div
          className="text-sm leading-none flex items-center h-[25px] gap-1">
          <div className="w-[20px] h-[15px] rounded-[4px]" style={{backgroundColor: getStatusColor('THROTTLE')}}/>
          Passed <br/> conditionally
        </div>
        <div
          className="text-sm leading-none flex items-center h-[25px] gap-1">
          <div className="w-[20px] h-[15px] rounded-[4px]" style={{backgroundColor: getStatusColor('REJECT')}}/>
          Failed
        </div>
        <div
          className="text-sm leading-none flex items-center h-[25px] gap-1">
          <div className="w-[20px] h-[15px] rounded-[4px]" style={{backgroundColor: getStatusColor('WAITING')}}/>
          Waiting
        </div>

      </div>
    );
  };

  if (!data?.length) {
    return null;
  }

  if (isLoading) {
    return <div className="flex w-full min-h-[350px] justify-center items-center">
      <ChartLoader/>
    </div>
  }

  return <ResponsiveContainer width="100%" aspect={chartData?.length ? 70 / chartData?.length : 1} debounce={500}>
    <BarChart
      data={chartData}
      layout="vertical"
      margin={{left: 150}}
    >
      <CartesianGrid strokeDasharray="3 3"/>
      <Tooltip content={renderTooltip}/>
      <YAxis dataKey="name" type="category" interval={0} minTickGap={0}
             tick={<CustomizedAxisTick/>}/>
      <XAxis type="number" name="PiB" domain={[0, maxValue]} tickCount={Math.floor(maxValue / 10) + 1}/>
      <Tooltip/>
      <Legend align="right" verticalAlign="middle" layout="vertical" content={renderLegend}/>
      {dataKeys.map((key) => <Bar layout="vertical" key={key} dataKey={key}
                                  style={{ stroke: '#fff', strokeWidth: 2 }}
                                  stackId="a">
        {
          chartData.map((entry, index) => (
            <Cell key={index} fill={getStatusColor(entry[key + 'Name']?.toString())}/>
          ))
        }
      </Bar>)}
      ))
    </BarChart>
  </ResponsiveContainer>
};

const CustomizedAxisTick = (props: {
  x?: number,
  y?: number,
  stroke?: string,
  payload?: { value: string }
}) => {
  const {x, y, payload} = props;
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dx={-5} dy={5} textAnchor="end" fill="#666" fontSize={15}>
        {payload?.value.substring(0, 20)}{(payload?.value?.length ?? 0) > 20 ? '...' : ''}
      </text>
    </g>
  );
};

export {AuditHistoryBarGraph};