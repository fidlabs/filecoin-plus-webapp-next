"use client";
import { useClientProvidersDetails } from "@/app/clients/(pages)/[id]/(pages)/providers/components/client-providers.provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { palette } from "@/lib/utils";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  type TooltipContentProps,
  XAxis,
  YAxis,
} from "recharts";
import {
  type NameType,
  type ValueType,
} from "recharts/types/component/DefaultTooltipContent";
const ProvidersBarChart = () => {
  const { providersChartData, activeProviderIndex, setActiveProviderIndex } =
    useClientProvidersDetails();

  const renderTooltip = (props: TooltipContentProps<ValueType, NameType>) => {
    const allocationData = props?.payload?.[0]?.payload;
    if (!allocationData) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle>{allocationData["name"]}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{allocationData["totalSize"]}</p>
        </CardContent>
      </Card>
    );
  };

  return (
    <ResponsiveContainer
      width={"100%"}
      maxHeight={800}
      aspect={1}
      debounce={50}
    >
      <BarChart
        data={providersChartData}
        margin={{ top: 40, right: 20, left: 20, bottom: 50 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis tickFormatter={(value) => `${value} %`} />
        <Tooltip defaultIndex={activeProviderIndex} content={renderTooltip} />
        <Bar
          dataKey="value"
          onClick={(val) => {
            window.open(`/storage-providers/${val.name}`, "_blank");
          }}
          onMouseLeave={() => setActiveProviderIndex(-1)}
          onMouseEnter={(_, index) => setActiveProviderIndex(index)}
          cursor="pointer"
        >
          {providersChartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={palette(index)}
              cursor="pointer"
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export { ProvidersBarChart };
