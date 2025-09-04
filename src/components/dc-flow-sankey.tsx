"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AllocatorsDCFlowData,
  useAllocatorsDCFlow,
} from "@/lib/hooks/cdp.hooks";
import {
  getLinksFromSankeyTree,
  getNodesFromSankeyTree,
  Link,
  Node,
  SankeyTree,
} from "@/lib/sankey-utils";
import { isPlainObject, partition } from "@/lib/utils";
import { filesize } from "filesize";
import NextLink from "next/link";
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
import { UTCDate } from "@date-fns/utc";

type Allocator = AllocatorsDCFlowData["data"][number];

type DCFlowTree = SankeyTree<{
  allocators: Allocator[];
  hidden?: boolean;
}>;

type DCFlowNode = Node & {
  allocators: Allocator[];
  hidden?: boolean;
};

interface ChartData {
  nodes: DCFlowNode[];
  links: Link[];
}

interface NodeProps {
  x: number;
  y: number;
  width: number;
  height: number;
  payload: DCFlowNode;
}

export interface DCFlowSankeyProps {
  snapshotDate?: Date;
}

const mdmaAllocatorId = "f03358620";
const epmaAllocatorId = "f03521515";

function sumAllocatorsDatacap(allocators: Allocator[]): bigint {
  return allocators.reduce(
    (sum, allocator) => sum + BigInt(allocator.datacap),
    0n
  );
}

function prepareRound5Tree(dcFlowData: AllocatorsDCFlowData): DCFlowTree {
  const allAllocators = dcFlowData.data.filter((allocator) => {
    if (allocator.typeOfAllocator === null || allocator.pathway === null) {
      return false;
    }

    return true;
  });

  const automaticAllocators = allAllocators.filter((entry) => {
    return entry.pathway === "Automatic" || entry.pathway === "RFA";
  });

  const [faucetAllocator, restOfAutomaticAllocators] =
    automaticAllocators.reduce<[Allocator | void, Allocator[]]>(
      (result, allocator) => {
        const [currentFaucetAllocator, currentAutomaticAllocators] = result;

        if (
          allocator.pathway === "RFA" &&
          allocator.typeOfAllocator === "RFA"
        ) {
          return [allocator, currentAutomaticAllocators];
        }

        return [
          currentFaucetAllocator,
          [...currentAutomaticAllocators, allocator],
        ];
      },
      [undefined, []]
    );

  const automaticTree: DCFlowTree = {
    name: "Automatic",
    value: Number(sumAllocatorsDatacap(automaticAllocators)),
    allocators: automaticAllocators,
    leafs: [
      {
        name: "Direct RKH Automatic",
        value: Number(sumAllocatorsDatacap(restOfAutomaticAllocators)),
        allocators: restOfAutomaticAllocators,
        leafs: [],
      },
      {
        name: "Faucet",
        value: faucetAllocator ? Number(faucetAllocator.datacap) : 0,
        allocators: faucetAllocator ? [faucetAllocator] : [],
        leafs: [],
        hidden: !faucetAllocator,
      },
    ],
  };

  const manualAllocators = allAllocators.filter((entry) => {
    return entry.typeOfAllocator === "Manual";
  });

  const [mdmaAllocators, restOfManualAllocators] = partition(
    manualAllocators,
    (allocator) => {
      return allocator.pathway === "Manual Pathway MetaAllocator";
    }
  );

  const manualTree: DCFlowTree = {
    name: "Manual",
    value: Number(sumAllocatorsDatacap(manualAllocators)),
    allocators: manualAllocators,
    leafs: [
      {
        name: "MDMA",
        value: Number(sumAllocatorsDatacap(mdmaAllocators)),
        allocators: mdmaAllocators,
        leafs: [],
      },
      {
        name: "Direct RKH Manual",
        value: Number(sumAllocatorsDatacap(restOfManualAllocators)),
        allocators: restOfManualAllocators,
        leafs: [],
      },
    ],
  };

  const experimentalAllocators = allAllocators.filter((entry) => {
    return entry.pathway === "Experimental Pathway MetaAllocator";
  });

  const experimentalTree: DCFlowTree = {
    name: "EPMA",
    value: Number(sumAllocatorsDatacap(experimentalAllocators)),
    allocators: experimentalAllocators,
    leafs: [
      {
        name: "EPMA Hidden Child",
        value: 0,
        allocators: [],
        leafs: [],
        hidden: true,
      },
    ],
  };

  return {
    name: "Root Key Holder",
    value: Number(sumAllocatorsDatacap(allAllocators)),
    leafs: [automaticTree, manualTree, experimentalTree],
    allocators: allAllocators,
  };
}

function prepareDefaultTree(dcFlowData: AllocatorsDCFlowData): DCFlowTree {
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

  const mdmaAllocators = allAllocators.filter(
    (allocator) => allocator.metapathwayType === "MDMA"
  );

  const mdmaTrees = Object.entries(
    mdmaAllocators.reduce<Record<string, Allocator[]>>((acc, allocator) => {
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
    }, {})
  ).map<DCFlowTree>(([name, allocators]) => {
    return {
      name,
      value: Number(sumAllocatorsDatacap(allocators)),
      allocators,
      leafs: [],
    };
  });

  const automatedAllocators = allAllocators.filter(
    (allocator) => allocator.applicationAudit === "Automated Allocator"
  );

  const otherAllocators = allAllocators.filter((allocator) => {
    return (
      allocator.metapathwayType === "RKH" &&
      allocator.applicationAudit !== "Automated Allocator"
    );
  });

  const [epmaAllocators, directRKHAllocators] = partition(
    otherAllocators,
    (allocator) => {
      return allocator.allocatorId === epmaAllocatorId;
    }
  );

  return {
    name: "Root Key Holder",
    value: Number(sumAllocatorsDatacap(allAllocators)),
    allocators: allAllocators,
    leafs: [
      {
        name: "MDMA",
        value: Number(sumAllocatorsDatacap(mdmaAllocators)),
        allocators: mdmaAllocators,
        leafs: mdmaTrees,
      },
      {
        name: "Automated",
        value: Number(sumAllocatorsDatacap(automatedAllocators)),
        allocators: automatedAllocators,
        leafs: [],
      },
      {
        name: "EPMA",
        value: Number(sumAllocatorsDatacap(epmaAllocators)),
        allocators: epmaAllocators,
        leafs: [],
      },
      {
        name: "Direct RKH",
        value: Number(sumAllocatorsDatacap(directRKHAllocators)),
        allocators: directRKHAllocators,
        leafs: [],
      },
    ],
  };
}

function dcFlowDataToChartData(
  dcFlowData: AllocatorsDCFlowData
): ChartData | null {
  const tree =
    dcFlowData.filPlusEditionId === 5
      ? prepareRound5Tree(dcFlowData)
      : prepareDefaultTree(dcFlowData);

  return {
    nodes: getNodesFromSankeyTree(tree),
    links: getLinksFromSankeyTree(tree),
  };
}

export function DCFlowSankey({ snapshotDate }: DCFlowSankeyProps) {
  const {
    data: allocatorsDCFlowData,
    error,
    isLoading,
  } = useAllocatorsDCFlow(snapshotDate);

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
    <div className="h-[620px] flex flex-col justify-center items-center">
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
        <>
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

          {!!allocatorsDCFlowData && (
            <p className="text-sm text-center text-muted-foreground">
              Showing state as of{" "}
              <strong className="font-semibold">
                {new UTCDate(
                  allocatorsDCFlowData.cutoffDate
                ).toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </strong>
            </p>
          )}
        </>
      )}
    </div>
  );
}

function CustomSankeyNode({ x, y, width, height, payload }: NodeProps) {
  const { name, allocators, hidden = false } = payload;

  if (hidden || isNaN(x) || isNaN(y)) {
    return <g transform={`translate(${x},${y})`}></g>;
  }

  const totalDatacap = sumAllocatorsDatacap(allocators);
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

  const totalDatacapString = filesize(totalDatacap, { standard: "iec" });

  return (
    <g transform={`translate(${x},${y})`}>
      {clickable ? (
        <Dialog>
          <DialogTrigger asChild>{rectElement}</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{name}</DialogTitle>
              <DialogDescription>
                {totalDatacapString} total datacap
              </DialogDescription>
            </DialogHeader>

            <ul className="max-h-[500px] overflow-auto flex flex-col gap-2">
              {allocators.map(({ allocatorId, allocatorName, datacap }) => (
                <li key={allocatorId}>
                  <div>
                    <Button variant="link" asChild>
                      <NextLink href={`/allocators/${allocatorId}`}>
                        {allocatorName ?? allocatorId}
                      </NextLink>
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
      <text
        x={width * 1.5}
        y={height / 2 - 7}
        fill="black"
        fontSize={14}
        fontWeight={500}
      >
        {name}
      </text>
      <text x={width * 1.5} y={height / 2 + 7} fill="black" fontSize={12}>
        {totalDatacapString}
      </text>
    </g>
  );
}
