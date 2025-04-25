import { InfoIcon } from "lucide-react";
import { Checkbox } from "./ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { ComponentProps, useCallback } from "react";

type CheckboxProps = ComponentProps<typeof Checkbox>;
type CheckedChangeHandler = NonNullable<CheckboxProps["onCheckedChange"]>;
type MetricType = "retrievability" | "numberOfClients" | "totalDealSize";
type MetricsConfig = Record<MetricType, boolean>;

interface Metric {
  type: MetricType;
  name: string;
  description: string;
}

export interface ComplianceMetricsSelectorProps {
  metricsConfig: MetricsConfig;
  onConfigChange(metricsConfig: MetricsConfig): void;
}

const metrics: Metric[] = [
  {
    type: "retrievability",
    name: "Retrievability",
    description: "Have retrievability score above average",
  },
  {
    type: "numberOfClients",
    name: "Clients Diversity",
    description: "Have at least 3 clients",
  },
  {
    type: "totalDealSize",
    name: "Biggest Allocation",
    description: "Has at most 30% of the DC coming from a single client",
  },
];

interface MetricProps {
  checked: boolean;
  metric: Metric;
  onValueChange(metricType: MetricType, value: boolean): void;
}

function Metric({ checked, metric, onValueChange }: MetricProps) {
  const handleCheckedChange = useCallback<CheckedChangeHandler>(
    (checkedStated) => {
      onValueChange(metric.type, checkedStated === true);
    },
    [metric.type, onValueChange]
  );

  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id={metric.type}
        checked={checked}
        onCheckedChange={handleCheckedChange}
      />
      <label className="text-sm font-medium leading-none" htmlFor={metric.type}>
        {metric.name}
      </label>

      <TooltipProvider key={metric.type}>
        <Tooltip>
          <TooltipTrigger asChild>
            <InfoIcon className="w-4 h-4 text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent>
            <p>{metric.description}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

export function ComplianceMetricsSelector({
  metricsConfig,
  onConfigChange,
}: ComplianceMetricsSelectorProps) {
  const handleMetricChange = useCallback(
    (metricType: MetricType, value: boolean) => {
      onConfigChange({
        ...metricsConfig,
        [metricType]: value,
      });
    },
    [metricsConfig, onConfigChange]
  );

  return (
    <div className="flex flex-wrap items-center gap-4">
      {metrics.map((metric) => (
        <Metric
          key={metric.type}
          metric={metric}
          checked={metricsConfig[metric.type]}
          onValueChange={handleMetricChange}
        />
      ))}
    </div>
  );
}
