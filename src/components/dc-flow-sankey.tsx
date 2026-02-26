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
import { isPlainObject, partition, stringToColor } from "@/lib/utils";
import { UTCDate } from "@date-fns/utc";
import { filesize } from "filesize";
import NextLink from "next/link";
import {
  ComponentProps,
  ReactNode,
  useCallback,
  useMemo,
  useState,
} from "react";
import {
  Layer,
  Rectangle,
  ResponsiveContainer,
  Sankey,
  Tooltip,
  useChartWidth,
  type TooltipContentProps,
} from "recharts";
import { type LinkProps, type NodeProps } from "recharts/types/chart/Sankey";
import { Button } from "./ui/button";
import { ChartLoader } from "./ui/chart-loader";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  TransformWrapper,
  TransformComponent,
  useControls,
} from "react-zoom-pan-pinch";
import {
  LocateFixedIcon,
  ShrinkIcon,
  XIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from "lucide-react";

type TransformWrapperProps = ComponentProps<typeof TransformWrapper>;
type ZoomHandler = NonNullable<TransformWrapperProps["onZoom"]>;
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

// Sankey click types are incomplete
interface SankeyNodeClickParameters {
  payload: DCFlowNode;
}

type SankeyClickHandler = (
  item: NodeProps | LinkProps,
  type: "link" | "node",
  e: MouseEvent
) => void;
export interface DCFlowSankeyProps {
  fullscreen?: boolean;
  snapshotDate?: Date;
  onFullscreenChange?(fullscreen: boolean): void;
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

const minZoom = 0.4;
const maxZoom = 2;

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
  const expanded = expandedNodeName === "*" || tree.name === expandedNodeName;

  if (tree.leafs.length === 0 && expanded) {
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

export function DCFlowSankey({
  fullscreen,
  snapshotDate,
  onFullscreenChange,
}: DCFlowSankeyProps) {
  const [zoom, setZoom] = useState(minZoom);
  const {
    data: allocatorsDCFlowData,
    error,
    isLoading,
  } = useAllocatorsDCFlow(snapshotDate);

  const { chartData, chartHeight, chartWidth } = useMemo<{
    chartData: ChartData | null;
    chartHeight: number;
    chartWidth: number | `${number}%`;
  }>(() => {
    if (!allocatorsDCFlowData) {
      return {
        chartData: null,
        chartHeight: 0,
        chartWidth: 0,
      };
    }

    const tree = dcFlowDataToDCFlowTree(allocatorsDCFlowData);
    const expandedTree = expandAllocatorTree(tree, fullscreen ? "*" : null);
    const paddedTree = fullscreen ? expandedTree : padTreeToDepth(expandedTree);
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

    return {
      chartData,
      chartHeight: Math.max(800, nonHiddenNonParentNodesCount * 64),
      chartWidth: fullscreen ? getTreeDepth(paddedTree) * 800 : "100%",
    };
  }, [allocatorsDCFlowData, fullscreen]);

  const handleSankeyClick = useCallback<SankeyClickHandler>(
    (params, elementType) => {
      if (elementType === "node") {
        const nodeClickParams = params as unknown as SankeyNodeClickParameters;
        const { allocators, expandable } = nodeClickParams.payload;

        if (expandable) {
          onFullscreenChange?.(true);
        } else if (allocators.length === 1) {
          const allocator = allocators[0];
          window.open(`/allocators/${allocator.allocatorId}`, "_blank");
        }
      }
    },
    [onFullscreenChange]
  );

  const handleFullscreenZoom = useCallback<ZoomHandler>((ref) => {
    setZoom(ref.state.scale);
  }, []);

  const renderTooltipContent = useCallback(
    ({ payload }: TooltipContentProps<number, string>): ReactNode => {
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

            {!!nodeData.expandable && !fullscreen && (
              <>
                <p>{allocatorsCount} Allocators</p>
                <p className="text-xs text-muted-foreground mt-4">
                  Click on the node to expand in full screen
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
    [fullscreen]
  );

  const chartElement = (() => {
    if (isLoading || !!error || !chartData) {
      return (
        <div>
          {isLoading && <ChartLoader />}

          {!isLoading && !!error && (
            <p className="text-center text-muted-foreground">
              An error has occured. Please try again later.
            </p>
          )}

          {!isLoading && !error && !chartData && (
            <p className="text-center text-muted-foreground">
              Nothing to show.
            </p>
          )}
        </div>
      );
    }

    return (
      <ResponsiveContainer width={chartWidth} height={chartHeight}>
        <Sankey
          data={chartData}
          node={CustomSankeyNode}
          nodePadding={50}
          link={ColouredLink}
          iterations={0}
          style={{
            cursor: fullscreen ? "grab" : "default",
          }}
          onClick={
            handleSankeyClick as unknown as ComponentProps<
              typeof Sankey
            >["onClick"]
          } // I feel bad but recharts types are broken
        >
          <Tooltip content={renderTooltipContent} />
        </Sankey>
      </ResponsiveContainer>
    );
  })();

  return (
    <>
      <div
        className={`h-[${chartHeight + 20}px] max-w-full overflow-y-auto flex flex-col justify-center items-center`}
      >
        {chartElement}

        {!isLoading && !error && !!chartData && !!allocatorsDCFlowData && (
          <p className="text-sm text-center text-muted-foreground">
            Showing state as of{" "}
            <strong className="font-semibold">
              {new UTCDate(allocatorsDCFlowData.cutoffDate).toLocaleDateString(
                "en-US",
                {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }
              )}
            </strong>
          </p>
        )}
      </div>

      <Dialog open={fullscreen} onOpenChange={onFullscreenChange}>
        <DialogContent className="max-w-screen h-screen p-0 sm:rounded-none">
          <TransformWrapper
            initialScale={minZoom}
            minScale={0.4}
            maxScale={maxZoom}
            onZoom={handleFullscreenZoom}
          >
            <TransformComponent wrapperClass="max-w-full max-h-full">
              <div className="landscape:p-[10vh] portrait:p-[10vw]">
                {chartElement}
              </div>
            </TransformComponent>
            <FullscreenControls zoom={zoom} />
          </TransformWrapper>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ColouredLink(props: LinkProps) {
  const {
    sourceX,
    targetX,
    sourceY,
    targetY,
    sourceControlX,
    targetControlX,
    linkWidth,
    index,
    payload,
  } = props;

  const color = stringToColor(payload.target.name);

  return (
    <Layer key={`CustomLink${index}`}>
      <path
        d={`
            M${sourceX},${sourceY + linkWidth / 2}
            C${sourceControlX},${sourceY + linkWidth / 2}
              ${targetControlX},${targetY + linkWidth / 2}
              ${targetX},${targetY + linkWidth / 2}
            L${targetX},${targetY - linkWidth / 2}
            C${targetControlX},${targetY - linkWidth / 2}
              ${sourceControlX},${sourceY - linkWidth / 2}
              ${sourceX},${sourceY - linkWidth / 2}
            Z
          `}
        fill={color ?? "var(--color-echo-blue)"}
        fillOpacity={0.25}
        strokeWidth="0"
      />
    </Layer>
  );
}

function CustomSankeyNode({ x, y, width, height, payload, index }: NodeProps) {
  const {
    name,
    allocators,
    expandable = false,
    hidden = false,
    totalDatacap,
  } = payload as unknown as DCFlowNode;

  const containerWidth = useChartWidth();

  if (containerWidth == null || hidden || isNaN(x) || isNaN(y)) {
    return <g transform={`translate(${x},${y})`}></g>;
  }

  const color =
    name === "Root Key Holder"
      ? "hsl(var(--color-dodger-blue))"
      : stringToColor(name);
  const isOut = x + width + 6 > containerWidth;
  const totalDatacapString = filesize(totalDatacap, { standard: "iec" });

  const content = (
    <Layer key={`CustomNode${index}`}>
      <Rectangle
        x={x}
        y={y}
        width={width}
        height={height}
        fill={color}
        fillOpacity="1"
      />
      <text
        textAnchor={isOut ? "end" : "start"}
        x={isOut ? x - 6 : x + width + 6}
        y={y + height / 2}
        fontSize="14"
        fontWeight={500}
        fill="black"
      >
        {name}
      </text>
      <text
        textAnchor={isOut ? "end" : "start"}
        x={isOut ? x - 6 : x + width + 6}
        y={y + height / 2 + 13}
        fontSize="12"
        fill="black"
      >
        {totalDatacapString}
      </text>
    </Layer>
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

function FullscreenControls({ zoom }: { zoom: number }) {
  const { zoomIn, zoomOut, centerView, resetTransform } = useControls();

  const handleCenterButtonClick = useCallback(() => {
    centerView();
  }, [centerView]);

  const handleZoomInButtonClick = useCallback(() => {
    zoomIn();
  }, [zoomIn]);

  const handleZoomOutButtonClick = useCallback(() => {
    zoomOut();
  }, [zoomOut]);

  const handleResetButtonClick = useCallback(() => {
    resetTransform();
  }, [resetTransform]);

  return (
    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 [&>button]:rounded-none [&>button:first-child]:rounded-l-md [&>button:last-child]:rounded-r-md">
      <Button
        title="Zoom Out"
        size="icon"
        disabled={zoom <= minZoom}
        onClick={handleZoomOutButtonClick}
      >
        <ZoomOutIcon />
      </Button>

      <Button
        title="Zoom In"
        size="icon"
        disabled={zoom >= maxZoom}
        onClick={handleZoomInButtonClick}
      >
        <ZoomInIcon />
      </Button>

      <Button
        title="Center Sankey"
        size="icon"
        onClick={handleCenterButtonClick}
      >
        <LocateFixedIcon />
      </Button>

      <Button title="Reset" size="icon" onClick={handleResetButtonClick}>
        <XIcon />
      </Button>

      <DialogClose asChild>
        <Button title="Exit Full Screen" size="icon">
          <ShrinkIcon />
        </Button>
      </DialogClose>
    </div>
  );
}
