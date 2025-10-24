import { cn } from "@/lib/utils";
import { type HTMLAttributes } from "react";
import { type TooltipContentProps } from "recharts";

type ValueType = number | string | Array<number | string>;
type NameType = number | string;
type DivProps = HTMLAttributes<HTMLDivElement>;

export type ChartTooltipContainerProps = DivProps;
export function ChartTooltipContainer({
  children,
  className,
  style,
  ...rest
}: ChartTooltipContainerProps) {
  return (
    <div
      {...rest}
      className={cn("bg-white shadow-f-card p-4 rounded-md", className)}
      style={{
        maxWidth: "min(50vw, 400px)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export type ChartTooltipHeaderProps = DivProps;
export function ChartTooltipHeader({
  children,
  className,
  ...rest
}: ChartTooltipHeaderProps) {
  return (
    <div {...rest} className={cn("mb-3", className)}>
      {children}
    </div>
  );
}

export type ChartTooltipTitleProps = HTMLAttributes<HTMLHeadingElement>;
export function ChartTooltipTitle({
  children,
  className,
  ...rest
}: ChartTooltipTitleProps) {
  return (
    <div {...rest} className={cn("text-md font-medium", className)}>
      {children}
    </div>
  );
}

export type ChartTooltipGridProps<
  Value extends ValueType,
  Name extends NameType,
> = Omit<DivProps, "children"> &
  Pick<ChartTooltipProps<Value, Name>, "formatter" | "payload">;
export function ChartTooltipGrid<
  Value extends ValueType,
  Name extends NameType,
>({
  className,
  formatter,
  payload,
  ...rest
}: ChartTooltipGridProps<Value, Name>) {
  if (!payload) {
    return null;
  }

  return (
    <div {...rest} className={cn("flex flex-wrap gap-x-4 gap-y-2", className)}>
      {payload.map((innerPayload, index) => {
        return (
          <div key={innerPayload.dataKey ?? index}>
            <p
              className="text-lg font-medium"
              style={{
                color: innerPayload.stroke ?? innerPayload.fill,
              }}
            >
              {formatter
                ? formatter(
                    innerPayload.value as Value,
                    innerPayload.name as Name,
                    innerPayload,
                    index,
                    payload ?? []
                  )
                : innerPayload.value}
            </p>
            <p className="text-xs text-muted-foreground">{innerPayload.name}</p>
          </div>
        );
      })}
    </div>
  );
}

export type ChartTooltipProps<
  Value extends ValueType,
  Name extends NameType,
> = TooltipContentProps<Value, Name>;
export function ChartTooltip<Value extends ValueType, Name extends NameType>(
  props: ChartTooltipProps<Value, Name>
) {
  if (!props.payload || props.payload.length === 0) {
    return null;
  }

  const labelText = props.labelFormatter
    ? props.labelFormatter(props.label, props.payload ?? [])
    : props.label;

  return (
    <ChartTooltipContainer>
      <ChartTooltipHeader>
        <ChartTooltipTitle>{labelText}</ChartTooltipTitle>
      </ChartTooltipHeader>

      <ChartTooltipGrid formatter={props.formatter} payload={props.payload} />
    </ChartTooltipContainer>
  );
}
