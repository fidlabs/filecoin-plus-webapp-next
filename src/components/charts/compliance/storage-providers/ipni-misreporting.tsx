import {useAggregatedIPNIMisreporting} from "@/lib/hooks/cdp.hooks";
import {ChartWrapper} from "@/app/compliance-data-portal/components/chart-wrapper";
import {Cell, Pie, PieChart, ResponsiveContainer, Tooltip} from "recharts";
import {PieSectorDataItem} from "recharts/types/polar/Pie";
import {ActiveShape, ActiveShapeSimple} from "@/components/ui/pie-active-shape";
import {palette} from "@/lib/utils";

interface Props {
  plain?: boolean;
}

export const IpniMissreporting = ({plain}: Props) => {

  const {
    chartData, isLoading
  } = useAggregatedIPNIMisreporting()

  return <ChartWrapper title={"IPNI Missreporting"} id={"IpniMissreporting"} plain={plain}>
    <ResponsiveContainer width={'100%'} maxHeight={800} aspect={1} debounce={50}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={'70%'}
          innerRadius={'55%'}
          fill="#8884d8"
          dataKey="value"
          activeShape={ActiveShape}
          cursor={'pointer'}
          paddingAngle={1}
          onClick={(val) => {
            window.open(`/storage-providers/${val.name}`, '_blank');
          }}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={palette(index)} cursor="pointer" />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  </ChartWrapper>
};