"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { convertBytesToIEC, isPlainObject } from "@/lib/utils";
import Link from "next/link";
import { ReactNode, useCallback } from "react";
import { ResponsiveContainer, Sankey, Tooltip, TooltipProps } from "recharts";
import { filesize } from "filesize";

interface Node {
  allocators: Array<{
    id: string;
    datacap: bigint;
    name: string;
  }>;
  name: string;
  last: boolean;
  totalDatacap: bigint;
}

interface Link {
  source: number;
  target: number;
  value: number;
}

interface Data {
  nodes: Node[];
  links: Link[];
}

interface NodeProps {
  x: number;
  y: number;
  width: number;
  height: number;
  payload: Node;
}

export interface DCFlowSankeyProps {
  data: Data;
}

const Node = ({ x, y, width, height, payload }: NodeProps) => {
  if (isNaN(x) || isNaN(y)) {
    return <g transform={`translate(${x},${y})`}></g>;
  }

  const { allocators, name, last } = payload;
  const empty = allocators.length === 0;

  return (
    <g
      transform={`translate(${x},${y})`}
      style={{ cursor: "pointer", pointerEvents: empty ? "none" : "all" }}
    >
      <Dialog>
        <DialogTrigger asChild>
          <rect
            x={-width}
            y={-5}
            width={width * 2}
            rx={4}
            height={height + 10}
            cursor={empty ? "default" : "pointer"}
            fill={empty ? "var(--color-horizon)" : "var(--color-dodger-blue)"}
          />
        </DialogTrigger>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>{payload.name}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[500px] overflow-auto flex flex-col gap-2">
            {allocators.map((allocator, index) => (
              <div key={index}>
                <div>
                  <Button asChild variant="link">
                    <Link href={`/allocators/${allocator.id}`}>
                      {allocator.name}
                    </Link>
                  </Button>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Total Datacap:</span>{" "}
                  {filesize(allocator.datacap, { standard: "iec" })}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
      <text
        x={width * 1.5}
        y={height / 2}
        fill="black"
        fontSize={12}
        cursor={last ? "default" : "pointer"}
      >
        {name}
      </text>
    </g>
  );
};

export function DCFlowSankey({ data }: DCFlowSankeyProps) {
  const renderTooltipContent = useCallback(
    ({ payload }: TooltipProps<number, string>): ReactNode => {
      const data = payload?.[0];

      if (!data) {
        return null;
      }

      const { name, value, payload: nodeOrLinkPayload } = data;
      const nodeData =
        nodeOrLinkPayload?.payload?.target ?? nodeOrLinkPayload?.payload;

      if (!isPlainObject(nodeData)) {
        return null;
      }

      return (
        <Card>
          <CardHeader>
            <CardTitle>{name ?? "Unknown Group"}</CardTitle>
          </CardHeader>
          <CardContent>
            {typeof value !== "undefined" && (
              <p>{convertBytesToIEC(value) + " Datacap"}</p>
            )}

            {Array.isArray(nodeData.allocators) && (
              <p>{nodeData.allocators.length} Allocators</p>
            )}
          </CardContent>
        </Card>
      );
    },
    []
  );

  return (
    <ResponsiveContainer width="100%" aspect={2}>
      <Sankey
        data={data}
        node={Node}
        nodePadding={50}
        link={{ stroke: "var(--color-medium-turquoise)" }}
        margin={{
          left: 50,
          right: 150,
          top: 100,
          bottom: 50,
        }}
      >
        <Tooltip content={renderTooltipContent} />
      </Sankey>
    </ResponsiveContainer>
  );
}
