import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type ArrayElement } from "@/lib/utils";
import { useCallback, type ComponentProps } from "react";

type WindowSize = ArrayElement<typeof windowSizes>;
type SelectProps = ComponentProps<typeof Select>;
type ValueChangeHandler = NonNullable<SelectProps["onValueChange"]>;

export interface HistoricalChartWindowSizeSelectProps
  extends Omit<SelectProps, "children" | "onValueChange" | "value"> {
  onWindowSizeChange(windowSize: WindowSize): void;
  windowSize: WindowSize;
}

const windowSizes = ["day", "week", "month"] as const;
const windowSizeLabelDict: Record<WindowSize, string> = {
  day: "Daily",
  week: "Weekly",
  month: "Monthly",
};

function isWindowSize(input: string): input is WindowSize {
  return (windowSizes as unknown as string[]).includes(input);
}

export function HistoricalChartWindowSizeSelect({
  windowSize,
  onWindowSizeChange,
  ...rest
}: HistoricalChartWindowSizeSelectProps) {
  const handleValueChange = useCallback<ValueChangeHandler>(
    (value) => {
      if (isWindowSize(value)) {
        onWindowSizeChange(value);
      }
    },
    [onWindowSizeChange]
  );

  return (
    <Select {...rest} value={windowSize} onValueChange={handleValueChange}>
      <SelectTrigger className="bg-background">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {windowSizes.map((availableWindowSize) => (
          <SelectItem key={availableWindowSize} value={availableWindowSize}>
            {windowSizeLabelDict[availableWindowSize]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
