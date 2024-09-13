import {convertBytesToIEC} from "@/lib/utils";
import {Sector} from "recharts";
import {PieSectorDataItem} from "recharts/types/polar/Pie";
import {ReactNode} from "react";



const ActiveShape = (props: PieSectorDataItem) => {
  const RADIAN = Math.PI / 180;
  const {name, cx = 0, cy = 0, midAngle = 0, innerRadius, outerRadius = 0, startAngle, endAngle, fill, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{name}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} fontSize={14} textAnchor={textAnchor} fill="#999">
        {`${convertBytesToIEC(value ?? 0)} (${percent?.toFixed(2)}%)`}
      </text>
    </g>
  );
};

const ActiveShapeSimple = (props: PieSectorDataItem, foreignObject?: ReactNode) => {
  const {name, cx = 0, cy = 0, innerRadius, outerRadius = 0, startAngle, endAngle, fill, percent, value } = props;

  return (
    <g>
      {foreignObject && <foreignObject x={cx - 75} y={cy - 75}  width="150" height="150">
        {foreignObject}
      </foreignObject>}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
};

export {ActiveShape, ActiveShapeSimple}