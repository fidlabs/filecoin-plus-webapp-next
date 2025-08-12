"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AllocatorsDCFlowData,
  useAllocatorsDCFlow,
} from "@/lib/hooks/cdp.hooks";
import { isPlainObject } from "@/lib/utils";
import { filesize } from "filesize";
import Link from "next/link";
import { ReactNode, useCallback, useMemo } from "react";
import { ResponsiveContainer, Sankey, Tooltip, TooltipProps } from "recharts";
import { Button } from "./ui/button";
import { ChartLoader } from "./ui/chart-loader";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

type Allocator = AllocatorsDCFlowData["data"][number];
interface TreeNode {
  name: string;
  allocators: Allocator[];
  leafs: TreeNode[];
}

interface Node {
  allocators: Allocator[];
  name: string;
  totalDatacap: bigint;
}

interface Link {
  source: number;
  target: number;
  value: number;
}

interface ChartData {
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
  snapshotDate?: Date;
}

const mdmaAllocatorId = "f03358620";

function sumAllocatorsDatacap(allocators: Allocator[]): bigint {
  return allocators.reduce(
    (sum, allocator) => sum + BigInt(allocator.datacap),
    0n
  );
}

function* createIndexGenerator(): Generator<number, number> {
  let index = 0;

  while (true) {
    yield index++;
  }
}

function getNodesFromTree(tree: TreeNode): Node[] {
  return [
    {
      name: tree.name,
      allocators: tree.allocators,
      totalDatacap: sumAllocatorsDatacap(tree.allocators),
    },
    ...tree.leafs.flatMap(getNodesFromTree),
  ];
}

function getLinksFromTree(
  tree: TreeNode,
  DONT_PASS__index_generator: Generator<
    number,
    number
  > = createIndexGenerator(),
  DONT_PASS__source: number = 0
): Link[] {
  const index = DONT_PASS__index_generator.next().value;

  if (index === 0) {
    if (tree.leafs.length === 0) {
      return [];
    }

    return tree.leafs.flatMap((leaf) =>
      getLinksFromTree(leaf, DONT_PASS__index_generator, index)
    );
  }

  return [
    {
      source: DONT_PASS__source,
      target: index,
      value: Number(sumAllocatorsDatacap(tree.allocators)),
    },
    ...tree.leafs.flatMap((leaf) =>
      getLinksFromTree(leaf, DONT_PASS__index_generator, index)
    ),
  ];
}

function dcFlowDataToChartData(
  dcFlowData: AllocatorsDCFlowData
): ChartData | null {
  const allAllocators = dcFlowData.data.filter((allocator) => {
    if (
      allocator.metapathwayType === null ||
      allocator.applicationAudit === null
    ) {
      return false;
    }

    // Filter out MDMA as it is it's own category on the Sankey
    if (allocator.allocatorId === mdmaAllocatorId) {
      return false;
    }

    return true;
  });

  if (allAllocators.length === 0) {
    return null;
  }

  const mdmaAllocators = allAllocators.filter(
    (allocator) => allocator.metapathwayType === "MDMA"
  );

  const tree: TreeNode = {
    name: "Root Key Holder",
    allocators: allAllocators,
    leafs: [
      {
        name: "MDMA",
        allocators: mdmaAllocators,
        leafs: Object.entries(
          mdmaAllocators.reduce<Record<string, Allocator[]>>(
            (acc, allocator) => {
              if (allocator.applicationAudit === null) {
                return acc;
              }

              return {
                ...acc,
                [allocator.applicationAudit]: [
                  ...(acc[allocator.applicationAudit] ?? []),
                  allocator,
                ],
              };
            },
            {}
          )
        ).map<TreeNode>(([name, allocators]) => {
          return {
            name,
            allocators,
            leafs: [],
            selectable: true,
          };
        }),
      },
      {
        name: "Automated",
        allocators: allAllocators.filter(
          (allocator) => allocator.applicationAudit === "Automated Allocator"
        ),
        leafs: [],
      },
      {
        name: "Direct RKH",
        allocators: allAllocators.filter((allocator) => {
          return (
            allocator.metapathwayType === "RKH" &&
            allocator.applicationAudit !== "Automated Allocator"
          );
        }),
        leafs: [],
      },
    ],
  };

  return {
    nodes: getNodesFromTree(tree),
    links: getLinksFromTree(tree),
  };
}

export function DCFlowSankey({ snapshotDate }: DCFlowSankeyProps) {
  const {
    data: allocatorsDCFlowData,
    error,
    isLoading,
  } = useAllocatorsDCFlow(snapshotDate);

  if (error) {
    console.warn(error);
  }

  const chartData = useMemo<ChartData | null>(() => {
    if (!allocatorsDCFlowData) {
      return null;
    }

    return dcFlowDataToChartData(allocatorsDCFlowData);
  }, [allocatorsDCFlowData]);

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

      const allocatorsCount = Array.isArray(nodeData.allocators)
        ? nodeData.allocators.length
        : 0;

      return (
        <Card>
          <CardHeader>
            <CardTitle>{name ?? "Unknown Group"}</CardTitle>
          </CardHeader>
          <CardContent>
            {typeof value !== "undefined" && (
              <p>{filesize(value, { standard: "iec" }) + " Datacap"}</p>
            )}

            {allocatorsCount > 0 && (
              <>
                <p>{allocatorsCount} Allocators</p>
                <p className="text-xs text-muted-foreground mt-4">
                  Click on the node to see more details
                </p>
              </>
            )}
          </CardContent>
        </Card>
      );
    },
    []
  );

  return (
    <div className="h-[600px] flex justify-center items-center">
      {isLoading && <ChartLoader />}

      {!isLoading && !!error && (
        <p className="text-center text-muted-foreground">
          An error has occured. Please try again later.
        </p>
      )}

      {!isLoading && !error && !chartData && (
        <p className="text-center text-muted-foreground">Nothing to show.</p>
      )}

      {!isLoading && !error && !!chartData && (
        <ResponsiveContainer width="100%" height={600}>
          <Sankey
            data={chartData}
            node={CustomSankeyNode}
            nodePadding={50}
            iterations={0}
            link={{ stroke: "var(--color-medium-turquoise)" }}
            margin={{
              left: 50,
              right: 300,
              top: 100,
              bottom: 50,
            }}
          >
            <Tooltip content={renderTooltipContent} />
          </Sankey>
        </ResponsiveContainer>
      )}
    </div>
  );
}

function CustomSankeyNode({ x, y, width, height, payload }: NodeProps) {
  if (isNaN(x) || isNaN(y)) {
    return <g transform={`translate(${x},${y})`}></g>;
  }

  const { name, allocators, totalDatacap } = payload;
  const clickable = allocators.length > 0;

  const rectElement = (
    <rect
      x={-width}
      y={-5}
      width={width * 2}
      rx={4}
      height={height + 10}
      cursor={!clickable ? "default" : "pointer"}
      fill={!clickable ? "var(--color-horizon)" : "var(--color-dodger-blue)"}
    />
  );

  return (
    <g transform={`translate(${x},${y})`}>
      {clickable ? (
        <Dialog>
          <DialogTrigger asChild>{rectElement}</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{name}</DialogTitle>
              <DialogDescription>
                {filesize(totalDatacap, { standard: "iec" })} total datacap
              </DialogDescription>
            </DialogHeader>

            <ul className="max-h-[500px] overflow-auto flex flex-col gap-2">
              {allocators.map(({ allocatorId, allocatorName, datacap }) => (
                <li key={allocatorId}>
                  <div>
                    <Button variant="link" asChild>
                      <Link href={`/allocators/${allocatorId}`}>
                        {allocatorName ?? allocatorId} ({allocatorId})
                      </Link>
                    </Button>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Datacap:</span>{" "}
                    {filesize(datacap, { standard: "iec" })}
                  </div>
                </li>
              ))}
            </ul>
          </DialogContent>
        </Dialog>
      ) : (
        rectElement
      )}
      <text x={width * 1.5} y={height / 2} fill="black" fontSize={12}>
        {name}
      </text>
    </g>
  );
}
