export interface ChartXAxisTickProps {
  x?: number;
  y?: number;
  stroke?: string;
  payload?: { value: string };
}

export function ChartXAxisTick(props: ChartXAxisTickProps) {
  const {
    x,
    y,
    payload = {
      value: "",
    },
  } = props;

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dx={5}
        dy={5}
        textAnchor="start"
        fontSize={13}
        fill="#666"
        transform="rotate(90)"
      >
        {payload.value.substring(0, 10)}
        {payload.value.length > 10 ? "..." : ""}
      </text>
    </g>
  );
}
