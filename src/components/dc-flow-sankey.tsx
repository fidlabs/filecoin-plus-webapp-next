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
const faucetMetaallocatorId = "f03136591";
const faucetAllocatorId = "f03220716";

// List of allocators that are groups on the chart and we show
// allocators under them. Need to filter them out to avoid showing
// duplicate datacap
const filteredAllocators = [mdmaAllocatorId, faucetMetaallocatorId];

function sumAllocatorsDatacap(allocators: Allocator[]): bigint {
  return allocators.reduce(
    (sum, allocator) => sum + BigInt(allocator.datacap),
    0n
  );
}

function createTreeForAllocators({
  name,
  allocators,
  leafs,
  hidden,
  createHiddenLeaf = false,
  hideWhenEmpty = false,
}: Pick<DCFlowTree, "name" | "allocators" | "hidden"> &
  Partial<Pick<DCFlowTree, "leafs">> & {
    createHiddenLeaf?: boolean;
    hideWhenEmpty?: boolean;
  }): DCFlowTree {
  const value = Number(sumAllocatorsDatacap(allocators));
  const hiddenBecauseEmpty = hideWhenEmpty && value === 0;

  const extraLeafs = createHiddenLeaf
    ? [
        {
          name: `${name} Hidden Leafs`,
          value: 0,
          allocators: [],
          leafs: [],
          hidden: true,
        },
      ]
    : [];

  return {
    name,
    allocators,
    hidden: hidden || hiddenBecauseEmpty,
    value,
    leafs: leafs ?? extraLeafs,
  };
}

function prepareRound5Tree(dcFlowData: AllocatorsDCFlowData): DCFlowTree {
  const allAllocators = dcFlowData.data
    .filter((allocator) => {
      if (allocator.typeOfAllocator === null || allocator.pathway === null) {
        return false;
      }

      return true;
    })
    .toSorted((a, b) => {
      const diff = BigInt(b.datacap) - BigInt(a.datacap);
      return Number(diff);
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

  const automaticTree = createTreeForAllocators({
    name: "Automatic",
    allocators: automaticAllocators,
    leafs: [
      createTreeForAllocators({
        name: "Direct RKH Automatic",
        allocators: restOfAutomaticAllocators,
      }),
      createTreeForAllocators({
        name: "Faucet",
        allocators: faucetAllocator ? [faucetAllocator] : [],
        hideWhenEmpty: true,
      }),
    ],
  });

  const manualAllocators = allAllocators.filter((entry) => {
    return entry.typeOfAllocator === "Manual";
  });

  const [mdmaAllocators, restOfManualAllocators] = partition(
    manualAllocators,
    (allocator) => {
      return allocator.pathway === "Manual Pathway MetaAllocator";
    }
  );

  const manualTree = createTreeForAllocators({
    name: "Manual",
    allocators: manualAllocators,
    leafs: [
      createTreeForAllocators({
        name: "MDMA",
        allocators: mdmaAllocators,
      }),
      createTreeForAllocators({
        name: "Direct RKH Manual",
        allocators: restOfManualAllocators,
      }),
    ],
  });

  const experimentalAllocators = allAllocators.filter((entry) => {
    return entry.pathway === "Experimental Pathway MetaAllocator";
  });

  const experimentalTree = createTreeForAllocators({
    name: "EPMA",
    allocators: experimentalAllocators,
    createHiddenLeaf: true,
  });

  return {
    name: "Root Key Holder",
    value: Number(sumAllocatorsDatacap(allAllocators)),
    leafs: [automaticTree, manualTree, experimentalTree],
    allocators: allAllocators,
  };
}

function prepareDefaultTree(dcFlowData: AllocatorsDCFlowData): DCFlowTree {
  const allAllocators = dcFlowData.data
    .filter((allocator) => {
      if (
        allocator.metapathwayType === null ||
        allocator.applicationAudit === null
      ) {
        return false;
      }

      // Filter out MDMA as it is it's own category on the Sankey
      if (filteredAllocators.includes(allocator.allocatorId)) {
        return false;
      }

      return true;
    })
    .toSorted((a, b) => {
      const diff = BigInt(b.datacap) - BigInt(a.datacap);
      return Number(diff);
    });

  const [mdmaAllocators, nonMdmaAllocators] = partition(
    allAllocators,
    (allocator) => {
      return allocator.metapathwayType === "MDMA";
    }
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
    return createTreeForAllocators({ name, allocators });
  });

  const mdmaTree = createTreeForAllocators({
    name: "Manual Diligence MetaAllocator",
    allocators: mdmaAllocators,
    leafs: mdmaTrees,
  });

  const [amaAllocators, nonAmaAllocators] = partition(
    nonMdmaAllocators,
    (allocator) => {
      return allocator.metapathwayType === "AMA";
    }
  );

  const amaTree = createTreeForAllocators({
    name: "Automatic Dilligence MetaAllocator",
    allocators: amaAllocators,
    createHiddenLeaf: true,
  });

  const [ormaAllocators, nonOrmaAllocators] = partition(
    nonAmaAllocators,
    (allocator) => {
      return allocator.metapathwayType === "ORMA";
    }
  );

  const ormaTree = createTreeForAllocators({
    name: "On Ramp MetaAllocator",
    allocators: ormaAllocators,
    createHiddenLeaf: true,
  });

  const [faucetAllocators, nonFaucetAllocators] = partition(
    nonOrmaAllocators,
    (candidate) => {
      return candidate.allocatorId === faucetAllocatorId;
    }
  );

  const faucetTree = createTreeForAllocators({
    name: "Faucet",
    allocators: faucetAllocators.length > 0 ? faucetAllocators : [],
    createHiddenLeaf: true,
    hideWhenEmpty: true,
  });

  const [epmaAllocators, nonEpmaAllocators] = partition(
    nonFaucetAllocators,
    (allocator) => {
      return allocator.allocatorId === epmaAllocatorId;
    }
  );

  const epmaTree = createTreeForAllocators({
    name: "Experimental Pathway MetaAllocator",
    allocators: epmaAllocators,
    createHiddenLeaf: true,
  });

  const [automatedAllocators, directRKHAllocators] = partition(
    nonEpmaAllocators,
    (allocator) => {
      return (
        allocator.applicationAudit === "Automated Allocator" ||
        allocator.applicationAudit === "Automated"
      );
    }
  );

  const automatedTree = createTreeForAllocators({
    name: "Automated",
    allocators: automatedAllocators,
    createHiddenLeaf: true,
    hideWhenEmpty: true,
  });

  const directRKHTree = createTreeForAllocators({
    name: "Direct RKH",
    allocators: directRKHAllocators,
    createHiddenLeaf: true,
    hideWhenEmpty: true,
  });

  return {
    name: "Root Key Holder",
    value: Number(sumAllocatorsDatacap(allAllocators)),
    allocators: allAllocators,
    leafs: [
      mdmaTree,
      epmaTree,
      amaTree,
      ormaTree,
      automatedTree,
      directRKHTree,
      faucetTree,
    ].sort((a, b) => {
      return b.value - a.value;
    }),
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
