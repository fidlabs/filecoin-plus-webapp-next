"use client";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { palette } from "@/lib/utils";
import { ActiveShape } from "@/components/ui/pie-active-shape";
import { useClientProvidersDetails } from "@/app/clients/(pages)/[id]/(pages)/providers/components/client-providers.provider";

const ProvidersPieChart = () => {
  const { providersChartData, activeProviderIndex, setActiveProviderIndex } =
    useClientProvidersDetails();

  const onPieEnter = (_: unknown, index: number) => {
    setActiveProviderIndex(index);
  };
  return (
    <ResponsiveContainer
      width={"100%"}
      maxHeight={800}
      aspect={1}
      debounce={50}
    >
      <PieChart>
        <Pie
          data={providersChartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={"70%"}
          innerRadius={"55%"}
          fill="#8884d8"
          dataKey="value"
          activeIndex={activeProviderIndex}
          activeShape={ActiveShape}
          onMouseEnter={onPieEnter}
          cursor={"pointer"}
          paddingAngle={1}
          onClick={(val) => {
            window.open(`/storage-providers/${val.name}`, "_blank");
          }}
        >
          {providersChartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={palette(index)}
              cursor="pointer"
            />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
};

export { ProvidersPieChart };
