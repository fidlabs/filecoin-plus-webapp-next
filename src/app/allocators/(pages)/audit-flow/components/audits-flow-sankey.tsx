"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AllocatorsAuditStatesResponse } from "@/lib/api";
import {
  getLinksFromSankeyTree,
  getNodesFromSankeyTree,
  Link,
  Node,
  SankeyTree,
} from "@/lib/sankey-utils";
import { isPlainObject } from "@/lib/utils";
import NextLink from "next/link";
import { ReactNode, useCallback, useMemo } from "react";
import {
  Layer,
  ResponsiveContainer,
  Sankey,
  Tooltip,
  TooltipProps,
} from "recharts";

type AuditOutcome =
  AllocatorsAuditStatesResponse[number]["audits"][number]["outcome"];

interface Audit {
  allocatorId: string;
  allocatorName: string | null;
  auditIndex: number;
  datacap: number;
  outcome: AuditOutcome;
}

type AuditsFlowTree = SankeyTree<{
  audits: Audit[];
  hidden?: boolean;
}>;

type AuditsFlowNode = Node & {
  audits: Audit[];
  hidden?: boolean;
};

const displayedOutcomes: AuditOutcome[] = [
  "passed",
  "passedConditionally",
  "failed",
];

interface ChartData {
  nodes: AuditsFlowNode[];
  links: Link[];
}

interface NodeProps {
  x: number;
  y: number;
  width: number;
  height: number;
  payload: AuditsFlowNode;
}

export interface AuditsFlowSankeyProps {
  data: AllocatorsAuditStatesResponse;
}

function partition<T>(input: T[], matchFn: (item: T) => boolean): [T[], T[]] {
  return input.reduce<[T[], T[]]>(
    ([matching, notMatching], item) => {
      const matches = matchFn(item);
      const nextMatching = matches ? [...matching, item] : matching;
      const nextNotMatching = matches ? notMatching : [...notMatching, item];
      return [nextMatching, nextNotMatching];
    },
    [[], []]
  );
}

function getTreeNameForOutcome(outcome: AuditOutcome): string {
  switch (outcome) {
    case "passed":
      return "Passed";
    case "passedConditionally":
      return "Passed Conditionally";
    case "failed":
      return "Failed";
    default:
      return outcome;
  }
}

function getTreeForAudit(audits: Audit[], auditIndex: number): AuditsFlowTree {
  const auditsForIndex = audits.filter((audit) => {
    return audit.auditIndex === auditIndex;
  });

  const outcomeTrees = displayedOutcomes
    .map<AuditsFlowTree>((outcome) => {
      const auditsForOutcome = auditsForIndex.filter((audit) => {
        return audit.outcome === outcome;
      });

      return {
        name: getTreeNameForOutcome(outcome),
        value: auditsForOutcome.reduce((sum, outcome) => {
          return sum + outcome.datacap;
        }, 0),
        audits: auditsForOutcome,
        leafs: [],
      };
    })
    .filter((tree) => tree.value !== 0);

  return {
    name: `Audit ${auditIndex + 1}`,
    value: outcomeTrees.reduce((sum, tree) => {
      return sum + tree.value;
    }, 0),
    leafs: outcomeTrees,
    audits: auditsForIndex,
  };
}

function auditStatesDataToChartData(
  auditStateData: AllocatorsAuditStatesResponse
): ChartData {
  const [auditedAllocators, notAuditedAllocators] = partition(
    auditStateData,
    (item) => item.audits.length > 0
  );

  const audits = auditedAllocators
    .flatMap((allocator) => {
      return allocator.audits.map<Audit>(
        (audit, auditIndex, allocatorAudits) => {
          const datacap = (() => {
            if (audit.outcome === "failed") {
              const previousAudit = allocatorAudits
                .slice(0, auditIndex)
                .findLast((candidateAudit) => {
                  return (
                    candidateAudit.outcome === "passed" ||
                    candidateAudit.outcome === "passedConditionally"
                  );
                });

              return previousAudit ? previousAudit.datacap_amount : 5;
            }

            return audit.datacap_amount;
          })();

          return {
            allocatorId: allocator.allocatorId,
            allocatorName: allocator.allocatorName,
            auditIndex,
            datacap,
            outcome: audit.outcome,
          };
        }
      );
    }, [])
    .filter((audit) => {
      return displayedOutcomes.includes(audit.outcome);
    });

  const maxAuditsCount = audits.reduce((max, audit) => {
    return Math.max(max, audit.auditIndex + 1);
  }, 0);

  const notAuditedTree: AuditsFlowTree = {
    name: "No Audit",
    value: notAuditedAllocators.length * 5,
    leafs: [
      {
        name: "No Audit Hidden",
        value: 0,
        audits: [],
        leafs: [],
        hidden: true,
      },
    ],
    audits: notAuditedAllocators.map((item) => {
      return {
        auditIndex: -1,
        allocatorId: item.allocatorId,
        allocatorName: item.allocatorName,
        datacap: 5,
        outcome: "unknown",
      };
    }),
  };

  const auditTrees = [...Array(maxAuditsCount)].map((_, auditIndex) => {
    return getTreeForAudit(audits, auditIndex);
  });

  const tree: AuditsFlowTree = {
    name: "Root Key Holder",
    leafs:
      notAuditedTree.value === 0 ? auditTrees : [notAuditedTree, ...auditTrees],
    value:
      notAuditedTree.value +
      auditTrees.reduce((sum, tree) => {
        return sum + tree.value;
      }, 0),
    audits: [
      ...notAuditedTree.audits,
      ...auditTrees.flatMap((tree) => tree.audits),
    ],
  };

  return {
    nodes: getNodesFromSankeyTree(tree),
    links: getLinksFromSankeyTree(tree),
  };
}

function getColorForNodeName(nodeName: string): string | null {
  switch (nodeName) {
    case getTreeNameForOutcome("passed"):
      return "var(--color-mountain-meadow)";
    case getTreeNameForOutcome("passedConditionally"):
      return "var(--warning)";
    case getTreeNameForOutcome("failed"):
      return "var(--destructive)";
    default:
      return null;
  }
}

export function AuditsFlowSankey({ data }: AuditsFlowSankeyProps) {
  const [chartData, directChildrenCount] = useMemo<[ChartData, number]>(() => {
    const chartData = auditStatesDataToChartData(data);
    const directChildrenCount = chartData.links.filter((link) => {
      return link.source === 0;
    }).length;

    return [chartData, directChildrenCount];
  }, [data]);

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

      const allocatorsCount = Array.isArray(nodeData.audits)
        ? nodeData.audits.length
        : 0;

      return (
        <Card>
          <CardHeader>
            <CardTitle>{name ?? "Unknown Group"}</CardTitle>
          </CardHeader>
          <CardContent>
            {typeof value !== "undefined" && <p>{value} PiB Datacap</p>}

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
    <div className="flex justify-center items-center">
      <ResponsiveContainer width="100%" height={directChildrenCount * 200}>
        <Sankey
          data={chartData}
          node={CustomSankeyNode}
          nodePadding={50}
          iterations={0}
          link={ColouredLink}
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
    </div>
  );
}

function CustomSankeyNode({ x, y, width, height, payload }: NodeProps) {
  const { name, audits, hidden = false } = payload;

  if (hidden || isNaN(x) || isNaN(y)) {
    return <g transform={`translate(${x},${y})`}></g>;
  }

  const clickable = audits.length > 0;
  const totalDatacap = audits.reduce((sum, audit) => {
    return sum + audit.datacap;
  }, 0);
  const color = getColorForNodeName(name);
  const fallbackColor = !clickable
    ? "var(--color-horizon)"
    : "var(--color-dodger-blue)";

  const rectElement = (
    <rect
      x={-width}
      y={-5}
      width={width * 2}
      rx={4}
      height={height + 10}
      cursor={!clickable ? "default" : "pointer"}
      fill={color ?? fallbackColor}
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
                {totalDatacap} PiB total datacap
              </DialogDescription>
            </DialogHeader>

            <ul className="max-h-[500px] overflow-auto flex flex-col gap-2">
              {audits.map(({ allocatorId, allocatorName, datacap }) => (
                <li key={allocatorId}>
                  <div>
                    <Button variant="link" asChild>
                      <NextLink href={`/allocators/${allocatorId}`}>
                        {allocatorName ?? allocatorId} ({allocatorId})
                      </NextLink>
                    </Button>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Datacap:</span>{" "}
                    {datacap} PiB
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
        {totalDatacap} PiB
      </text>
    </g>
  );
}

function ColouredLink(props: {
  sourceX: number;
  targetX: number;
  sourceY: number;
  targetY: number;
  sourceControlX: number;
  targetControlX: number;
  sourceRelativeY: number;
  targetRelativeY: number;
  linkWidth: number;
  index: number;
  payload: {
    source: {
      name: string;
      datacap: number;
      allocators: number;
      nodeId: number;
      isParent: boolean;
      hasChildren: boolean;
      value: number;
    };
    target: {
      name: string;
      datacap: number;
      allocators: number;
      nodeId: number;
      isParent: boolean;
      hasChildren: boolean;
      value: number;
    };
    value: number;
    datacap: number;
    allocators: number;
    hasChildren: boolean;
    dy: number;
    sy: number;
    ty: number;
  };
}) {
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

  const color = getColorForNodeName(payload.target.name);

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
        fillOpacity={0.35}
        strokeWidth="0"
      />
    </Layer>
  );
}
