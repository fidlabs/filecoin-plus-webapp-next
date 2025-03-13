"use client"
import { useAggregatedIPNIMisreporting } from "@/lib/hooks/cdp.hooks";
import { ChartWrapper } from "@/app/compliance-data-portal/components/chart-wrapper";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { ActiveShape } from "@/components/ui/pie-active-shape";
import { palette } from "@/lib/utils";
import {ChartLoader} from "@/components/ui/chart-loader";

const IPNIMisreporting = () => {
  const { chartData, isLoading } = useAggregatedIPNIMisreporting();

  return (
    <ChartWrapper title="IPNI Misreporting" id="IpniMisreporting">
      {
        isLoading && <div className="flex w-full aspect-square mah-h-[800px] justify-center items-center">
          <ChartLoader/>
        </div>
      }
      <ResponsiveContainer
        width={"100%"}
        maxHeight={800}
        aspect={1}
        debounce={50}
      >
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={"70%"}
            innerRadius={"55%"}
            fill="#8884d8"
            dataKey="value"
            label={ActiveShape}
            cursor={"pointer"}
            paddingAngle={1}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={palette(index)}
                cursor="pointer"
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
};

export default IPNIMisreporting
