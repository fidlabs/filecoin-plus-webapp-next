"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AllocatorsDCFlowData,
  useAllocatorsDCFlow,
} from "@/lib/hooks/cdp.hooks";
import {
  getLinksFromSankeyTree,
  getNodesFromSankeyTree,
  getTreeDepth,
  Link,
  Node,
  SankeyTree,
} from "@/lib/sankey-utils";
import { isPlainObject, partition } from "@/lib/utils";
import { UTCDate } from "@date-fns/utc";
import { filesize } from "filesize";
import NextLink from "next/link";
import { ReactNode, useCallback, useMemo, useState } from "react";
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

type DCFlowExtras = {
  allocators: Allocator[];
  expandable?: boolean;
  hidden?: boolean;
  totalDatacap: bigint;
};

type DCFlowTree = SankeyTree<DCFlowExtras>;
type DCFlowNode = Node & DCFlowExtras;

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

// Sankey click types are incomplete
interface SankeyNodeClickParameters {
  payload: DCFlowNode;
}
interface SankeyLinkClickParameters {
  payload: {
    source: DCFlowNode;
    target: DCFlowNode;
  };
}
interface SankeyClickHandler {
  (
    parameters: SankeyNodeClickParameters,
    elementType: "node",
    event: unknown
  ): void;
  (
    parameters: SankeyLinkClickParameters,
    elementType: "link",
    event: unknown
  ): void;
}

export interface DCFlowSankeyProps {
  snapshotDate?: Date;
}

const nodeNamesDict = {
  RKH: "Root Key Holder",
  MDMA: "Manual Diligence MetaAllocator",
  EPMA: "Experimental Pathway MetaAllocator",
  ADMA: "Automatic Dilligence MetaAllocator",
  ORMA: "On Ramp MetaAllocator",
  Automatic: "Automatic",
  Manual: "Manual",
  DirectRKH: "Direct RKH",
  DirectRKHAutomatic: "Direct RKH Automatic",
  DirectRKHManual: "Direct RKH Manual",
  Faucet: "Faucet",
} as const satisfies Record<string, string>;

const mdmaAllocatorId = "f03358620";
const epmaAllocatorId = "f03521515";
const faucetMetaallocatorId = "f03136591";
const faucetAllocatorId = "f03220716";
const ormaAllocatorId = "f03634130";

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
  hideWhenEmpty = false,
}: Pick<DCFlowTree, "name" | "allocators" | "hidden"> &
  Partial<Pick<DCFlowTree, "leafs">> & {
    hideWhenEmpty?: boolean;
  }): DCFlowTree {
  const totalDatacap = sumAllocatorsDatacap(allocators);
  const value = Number(totalDatacap);
  const hiddenBecauseEmpty = hideWhenEmpty && value === 0;

  return {
    name,
    allocators,
    totalDatacap,
    hidden: hidden || hiddenBecauseEmpty,
    value,
    leafs: leafs ?? [],
    expandable: (!leafs || leafs.length === 0) && allocators.length > 1,
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

  const allAllocatorsDatacap = sumAllocatorsDatacap(allAllocators);

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
    name: nodeNamesDict.Automatic,
    allocators: automaticAllocators,
    leafs: [
      createTreeForAllocators({
        name: nodeNamesDict.DirectRKHAutomatic,
        allocators: restOfAutomaticAllocators,
      }),
      createTreeForAllocators({
        name: nodeNamesDict.Faucet,
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
    name: nodeNamesDict.Manual,
    allocators: manualAllocators,
    leafs: [
      createTreeForAllocators({
        name: nodeNamesDict.MDMA,
        allocators: mdmaAllocators,
      }),
      createTreeForAllocators({
        name: nodeNamesDict.DirectRKHManual,
        allocators: restOfManualAllocators,
      }),
    ],
  });

  const experimentalAllocators = allAllocators.filter((entry) => {
    return entry.pathway === "Experimental Pathway MetaAllocator";
  });

  const experimentalTree = createTreeForAllocators({
    name: nodeNamesDict.EPMA,
    allocators: experimentalAllocators,
  });

  return {
    name: nodeNamesDict.RKH,
    totalDatacap: allAllocatorsDatacap,
    value: Number(allAllocatorsDatacap),
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

  const allAllocatorsDatacap = sumAllocatorsDatacap(allAllocators);

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
    return createTreeForAllocators({
      name,
      allocators,
    });
  });

  const mdmaTree = createTreeForAllocators({
    name: nodeNamesDict.MDMA,
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
    name: nodeNamesDict.ADMA,
    allocators: amaAllocators,
  });

  const [ormaAllocators, nonOrmaAllocators] = partition(
    nonAmaAllocators,
    (allocator) => {
      return (
        allocator.allocatorId === ormaAllocatorId ||
        allocator.metapathwayType === "ORMA"
      );
    }
  );

  const ormaTree = createTreeForAllocators({
    name: nodeNamesDict.ORMA,
    allocators:
      ormaAllocators.length > 1
        ? ormaAllocators.filter((allocator) => {
            return allocator.allocatorId !== ormaAllocatorId;
          })
        : ormaAllocators,
  });

  const [faucetAllocators, nonFaucetAllocators] = partition(
    nonOrmaAllocators,
    (candidate) => {
      return candidate.allocatorId === faucetAllocatorId;
    }
  );

  const faucetTree = createTreeForAllocators({
    name: nodeNamesDict.Faucet,
    allocators: faucetAllocators.length > 0 ? faucetAllocators : [],
    hideWhenEmpty: true,
  });

  const [epmaAllocators, nonEpmaAllocators] = partition(
    nonFaucetAllocators,
    (allocator) => {
      return allocator.allocatorId === epmaAllocatorId;
    }
  );

  const epmaTree = createTreeForAllocators({
    name: nodeNamesDict.EPMA,
    allocators: epmaAllocators,
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
    name: nodeNamesDict.Automatic,
    allocators: automatedAllocators,
    hideWhenEmpty: true,
  });

  const directRKHTree = createTreeForAllocators({
    name: nodeNamesDict.DirectRKH,
    allocators: directRKHAllocators,
    hideWhenEmpty: true,
  });

  return {
    name: nodeNamesDict.RKH,
    totalDatacap: allAllocatorsDatacap,
    value: Number(allAllocatorsDatacap),
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

function dcFlowDataToDCFlowTree(dcFlowData: AllocatorsDCFlowData): DCFlowTree {
  return dcFlowData.filPlusEditionId === 5
    ? prepareRound5Tree(dcFlowData)
    : prepareDefaultTree(dcFlowData);
}

function expandAllocatorTree(
  tree: DCFlowTree,
  expandedNodeName: string | null
): DCFlowTree {
  if (tree.name === expandedNodeName && tree.leafs.length === 0) {
    return {
      ...tree,
      leafs: tree.allocators.map((allocator) => {
        const rawName = allocator.allocatorName ?? allocator.allocatorId;
        const name =
          rawName.length > 20 ? rawName.slice(0, 20) + "..." : rawName;
        const totalDatacap = BigInt(allocator.datacap);

        return {
          name,
          value: Number(totalDatacap),
          allocators: [allocator],
          totalDatacap,
          leafs: [],
        };
      }),
    };
  }

  return {
    ...tree,
    leafs: tree.leafs.map((leaf) => {
      return expandAllocatorTree(leaf, expandedNodeName);
    }),
  };
}

function padTreeToDepth(
  tree: DCFlowTree,
  DONT_PASS__remainingPadding: number | null = null
): DCFlowTree {
  if (DONT_PASS__remainingPadding === 0) {
    return tree;
  }

  const nextPadding =
    DONT_PASS__remainingPadding === null
      ? getTreeDepth(tree) - 1
      : DONT_PASS__remainingPadding - 1;

  return {
    ...tree,
    leafs:
      tree.leafs.length === 0
        ? [
            padTreeToDepth(
              {
                name: "Hidden",
                value: 0,
                allocators: [],
                leafs: [],
                totalDatacap: 0n,
                hidden: true,
              },
              nextPadding
            ),
          ]
        : tree.leafs.map((leaf) => {
            return padTreeToDepth(leaf, nextPadding);
          }),
  };
}

export function DCFlowSankey({ snapshotDate }: DCFlowSankeyProps) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const {
    data: allocatorsDCFlowData,
    error,
    isLoading,
  } = useAllocatorsDCFlow(snapshotDate);

  const [chartData, chartHeight] = useMemo<[ChartData | null, number]>(() => {
    if (!allocatorsDCFlowData) {
      return [null, 0];
    }

    const tree = dcFlowDataToDCFlowTree(allocatorsDCFlowData);
    const expandedTree = expandAllocatorTree(tree, selectedNode);
    const paddedTree = padTreeToDepth(expandedTree);
    const nodes = getNodesFromSankeyTree(paddedTree);
    const links = getLinksFromSankeyTree(paddedTree);

    const nonHiddenNonParentNodes = nodes.filter((node, nodeIndex) => {
      if (node.hidden) {
        return false;
      }

      const hasChildNodes = links.some((link) => {
        return link.source === nodeIndex && !nodes[link.target].hidden;
      });

      return !hasChildNodes;
    });

    const nonHiddenNonParentNodesCount = nonHiddenNonParentNodes.length;

    const chartData: ChartData = {
      nodes,
      links,
    };

    return [chartData, Math.max(800, nonHiddenNonParentNodesCount * 64)];
  }, [allocatorsDCFlowData, selectedNode]);

  const handleSankeyClick = useCallback<SankeyClickHandler>(
    (params, elementType) => {
      if (elementType === "node") {
        const nodeClickParams = params as SankeyNodeClickParameters;
        const { allocators, expandable } = nodeClickParams.payload;

        if (expandable) {
          setSelectedNode((currentSelectedNode) => {
            return currentSelectedNode === nodeClickParams.payload.name
              ? null
              : nodeClickParams.payload.name;
          });
        } else if (allocators.length === 1) {
          const allocator = allocators[0];
          window.open(`/allocators/${allocator.allocatorId}`, "_blank");
        }
      }
    },
    []
  );

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

            {!!nodeData.expandable && (
              <>
                <p>{allocatorsCount} Allocators</p>
                <p className="text-xs text-muted-foreground mt-4">
                  Click on the node to expand / contract
                </p>
              </>
            )}

            {!nodeData.expandable && allocatorsCount === 1 && (
              <p className="text-xs text-muted-foreground mt-4">
                Click on the node to see allocator details
              </p>
            )}

            {!nodeData.expandable && allocatorsCount > 1 && (
              <>
                <p>{allocatorsCount} Allocators</p>
                <p className="text-xs text-muted-foreground mt-4">
                  Click on the node to see list of allocators
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
    <div
      className={`h-[${chartHeight + 20}px] max-w-full overflow-y-auto flex flex-col justify-center items-center`}
    >
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
          <ResponsiveContainer width="100%" height={chartHeight}>
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
              onClick={handleSankeyClick}
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
  const {
    name,
    allocators,
    expandable = false,
    hidden = false,
    totalDatacap,
  } = payload;

  if (hidden || isNaN(x) || isNaN(y)) {
    return <g transform={`translate(${x},${y})`}></g>;
  }

  const totalDatacapString = filesize(totalDatacap, { standard: "iec" });
  const clickable = allocators.length > 0;

  const content = (
    <g
      transform={`translate(${x},${y})`}
      cursor={!clickable ? "default" : "pointer"}
    >
      <rect
        x={-width}
        y={-5}
        width={width * 2}
        rx={4}
        height={height + 10}
        fill={
          !clickable ? "var(--color-horizon)" : "hsl(var(--color-dodger-blue))"
        }
      />
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

  return !expandable && allocators.length > 1 ? (
    <Dialog>
      <DialogTrigger asChild>{content}</DialogTrigger>
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
    content
  );
}
