import { useCallback, useEffect, useMemo, useState } from "react";
import { DataCapChild } from "@/lib/hooks/dmob.hooks";
import { cn, convertBytesToIEC, convertBytesToIECSimple } from "@/lib/utils";
import {
  Layer,
  ResponsiveContainer,
  Sankey,
  Tooltip as RechartsTooltip,
} from "recharts";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { TooltipProps } from "recharts";
import {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { MaximizeIcon, MinimizeIcon } from "lucide-react";
import {
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Tooltip,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  IAllocatorsWithSheetInfo,
  IAllocatorWithSheetInfo,
} from "@/lib/interfaces/cdp/google.interface";
import Link from "next/link";

interface Props {
  data: DataCapChild[] | undefined;
  rawData: IAllocatorsWithSheetInfo;
}

interface SankeyNode {
  name: string;
  datacap: number | undefined;
  allocators: number | undefined;
  rawData?: IAllocatorWithSheetInfo[];
  childObject: DataCapChild;
  hasChildren?: boolean;
  nodeId?: number;
  isParent?: boolean;
  isHidden?: boolean;
}

interface SankeyLink {
  source: number;
  target: number;

  [key: string]: unknown;
}

interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

const getAuditResultColor = (nodeName: string) => {
  switch (nodeName) {
    case "Pass":
      return "var(--color-mountain-meadow)"; // Green using Tailwind CSS variable
    case "Conditional":
      return "var(--warning)"; // Orange using Tailwind CSS variable
    case "Failed":
      return "var(--destructive)"; // Red using Tailwind CSS variable
    default:
      return null; // Use default color logic
  }
};

const DataCapFlowSankey = ({ data, rawData }: Props) => {
  const [selectedNodes, setSelectedNodes] = useState<DataCapChild[]>([]);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    if (data) {
      setSelectedNodes([data[0]]);
    }
  }, [data]);

  const renderTooltip = useCallback(
    (props: TooltipProps<ValueType, NameType>) => {
      const linkData = props?.payload?.[0]?.payload?.payload;
      const nodeData = linkData?.target ?? linkData;
      if (!nodeData) {
        return <></>;
      }
      const { name, datacap, allocators } = nodeData;
      return (
        <>
          <Card key={name}>
            <CardHeader>
              <CardTitle>{name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{convertBytesToIEC(datacap)} Datacap</p>
              {allocators > 0 && <p>{allocators} Allocators</p>}
              {expanded && (
                <p className="text-xs text-muted-foreground mt-4">
                  Click on the node to see more details
                </p>
              )}
            </CardContent>
          </Card>
        </>
      );
    },
    [expanded]
  );

  const handleNodeClick = (data: {
    payload: {
      target: string;
      name: string;
      datacap: number;
      allocators: number;
      isParent: boolean;
      hasChildren: boolean;
      arrayIndex: number;
      childObject: DataCapChild;
    };
  }) => {
    if (data.payload?.target) {
      return;
    }
    const hasChildren = data?.payload?.hasChildren;
    const isParent = data?.payload?.isParent;
    const name = data?.payload?.name;
    const lastSelectedNode = selectedNodes[selectedNodes.length - 1];

    if (lastSelectedNode.name === name && isParent) {
      setSelectedNodes(selectedNodes.slice(0, -1));
      return;
    }

    if (!hasChildren) {
      return;
    }

    const childObject = data?.payload?.childObject;

    setSelectedNodes([...selectedNodes, childObject]);
  };

  const handleBackClick = (backIndex: number) => {
    setSelectedNodes(selectedNodes.slice(0, backIndex + 1));
  };

  const parseData = useCallback(
    (currentNode: DataCapChild) => {
      return {
        nodes: [
          {
            name: currentNode?.name,
            datacap: currentNode?.attributes?.datacap,
            allocators: currentNode?.attributes?.allocators,
            isParent: selectedNodes.length > 1,
          },
          ...(currentNode?.children?.map((child) => ({
            name: child?.name,
            datacap: child?.attributes?.datacap,
            allocators: child?.attributes?.allocators,
            childObject: child,
            // hasChildren: !!child?.children?.map(item => !!item.children?.length).filter(val => !!val).length,
            hasChildren: !!child?.children
              ?.map((item) => !!item.children?.length)
              .filter((val) => val).length,
          })) || []),
        ],
        links:
          currentNode?.children?.map((child, index) => ({
            source: 0,
            target: index + 1,
            value: (child?.attributes?.datacap ?? 0) + 1,
            datacap: child?.attributes?.datacap,
            allocators: child?.attributes?.allocators,
            // hasChildren: !!child?.children?.map(item => !!item.children?.length).filter(val => !!val).length,
            hasChildren: !!child?.children
              ?.map((item) => !!item.children?.length)
              .filter((val) => val).length,
          })) || [],
      };
    },
    [selectedNodes.length]
  );

  const parseNodes = useCallback(
    (currentNode: DataCapChild) => {
      const hasChildren = !!currentNode?.children
        ?.map((item) => !!item.children?.length)
        .filter((val) => val).length;
      let nodes = [
        {
          name: currentNode?.name,
          datacap: currentNode?.attributes?.datacap,
          allocators: currentNode?.attributes?.allocators,
          rawData: rawData.data.filter((item) =>
            currentNode.attributes.allocatorsIdList
              ?.split(",")
              .includes(item.addressId)
          ),
          nodeId: currentNode?.nodeId,
          isParent: false,
          hasChildren: false,
        },
      ] as SankeyNode[];

      if (hasChildren) {
        nodes = [
          ...nodes,
          ...(currentNode?.children?.flatMap((child) => parseNodes(child)) ||
            []),
        ];
      }

      return nodes;
    },
    [rawData.data]
  );

  const parseLinks = useCallback(
    (currentNode: DataCapChild, parentId?: number) => {
      const hasChildren = !!currentNode?.children
        ?.map((item) => !!item.children?.length)
        .filter((val) => val).length;
      let links = [] as SankeyLink[];

      if (parentId !== undefined) {
        links = [
          {
            source: parentId,
            target: currentNode.nodeId,
            value:
              convertBytesToIECSimple(currentNode?.attributes?.datacap ?? 0) +
              1,
            datacap: currentNode?.attributes?.datacap,
            allocators: currentNode?.attributes?.allocators,
            hasChildren: !!currentNode?.children
              ?.map((item) => !!item.children?.length)
              .filter((val) => val).length,
          },
        ];
      }

      if (hasChildren) {
        links = [
          ...links,
          ...(currentNode?.children?.flatMap((child) =>
            parseLinks(child, currentNode.nodeId)
          ) || []),
        ];
      }

      return links;
    },
    []
  );

  const sankeyData = useMemo(() => {
    if (!data || !selectedNodes?.length) {
      return null;
    }

    if (expanded) {
      const nodes = parseNodes(data[0]);
      const links = parseLinks(data[0]);

      return {
        nodes: [
          ...nodes,
          {
            name: "Hidden",
            isHidden: true,
            nodeId: nodes.length,
          },
        ],
        links: [
          ...links,
          {
            source:
              nodes.find((node) => node.name === "Not Active")?.nodeId ?? 0,
            target: nodes.length,
            value: 0.1,
            datacap: 0,
            allocators: [],
            hasChildren: false,
          },
          {
            source:
              nodes.find((node) => node.name === "Not Audited")?.nodeId ?? 0,
            target: nodes.length,
            value: 0.1,
            datacap: 0,
            allocators: [],
            hasChildren: false,
          },
        ],
      } as SankeyData;
    } else {
      return parseData(selectedNodes[selectedNodes.length - 1]) as SankeyData;
    }
  }, [data, selectedNodes, expanded, parseNodes, parseLinks, parseData]);

  return (
    <div className="relative">
      {!expanded && (
        <Breadcrumb className="mx-6">
          <BreadcrumbList>
            {selectedNodes.map((node, index) => {
              return (
                <>
                  <BreadcrumbItem
                    key={index}
                    onClick={() => handleBackClick(index)}
                  >
                    {node.name}
                  </BreadcrumbItem>
                  {index < selectedNodes.length - 1 && <BreadcrumbSeparator />}
                </>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      )}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="absolute top-0 right-0 m-6 z-10 flex items-center justify-center group transition-all hover:gap-2 hover:w-36"
              variant="outline"
              size="icon"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <MinimizeIcon /> : <MaximizeIcon />}
              <p className="w-0 group-hover:w-16 transition-all overflow-hidden">
                {expanded ? "Collapse" : "Expand"}
              </p>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Add to library</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {sankeyData && (
        <ResponsiveContainer
          width="100%"
          aspect={expanded ? 1.2 : 2}
          debounce={100}
        >
          <Sankey
            data={sankeyData}
            nodePadding={50}
            node={expanded ? ExpandedNode : Node}
            iterations={0}
            margin={{
              left: 50,
              right: 150,
              top: 100,
              bottom: 50,
            }}
            onClick={handleNodeClick}
            link={ColouredLink}
          >
            <RechartsTooltip content={renderTooltip} />
          </Sankey>
        </ResponsiveContainer>
      )}
    </div>
  );
};

interface NodeProps {
  x: number;
  y: number;
  width: number;
  height: number;
  index: number;
  payload: {
    name: string;
    datacap: number;
    allocators: number;
    isParent: boolean;
    isHidden?: boolean;
    hasChildren: boolean;
    rawData?: IAllocatorWithSheetInfo[];
  };
}

const Node = ({ x, y, width, height, payload }: NodeProps) => {
  const hasChildren = payload.hasChildren || payload.isParent;

  let nodeColor = getAuditResultColor(payload.name);

  if (!nodeColor) {
    nodeColor = hasChildren
      ? "var(--color-dodger-blue)"
      : "var(--color-horizon)";
  }

  return (
    <g transform={`translate(${x},${y})`} style={{ cursor: "pointer" }}>
      <rect
        x={-width}
        y={-5}
        width={width * 2}
        rx={4}
        height={height + 10}
        cursor={hasChildren ? "pointer" : "default"}
        fill={nodeColor}
      />
      <text
        x={width * 1.5}
        y={height / 2}
        fill="black"
        fontSize={12}
        cursor={hasChildren ? "pointer" : "default"}
      >
        {payload.name}
      </text>
    </g>
  );
};

const ExpandedNode = ({ x, y, width, height, payload }: NodeProps) => {
  const hasChildren = payload.hasChildren || payload.isParent;
  const rawData = payload.rawData;
  const isHidden = payload.isHidden;
  if (isHidden || isNaN(x) || isNaN(y)) {
    return <g transform={`translate(${x},${y})`}></g>;
  }

  let nodeColor = getAuditResultColor(payload.name);

  if (!nodeColor) {
    nodeColor = !!rawData?.length
      ? "var(--color-dodger-blue)"
      : "var(--color-horizon)";
  }

  return (
    <g
      transform={`translate(${x},${y})`}
      style={{
        cursor: "pointer",
        pointerEvents: !!rawData?.length ? "all" : "none",
      }}
    >
      <Dialog>
        <DialogTrigger asChild>
          <rect
            x={-width}
            y={-5}
            width={width * 2}
            rx={6}
            height={height + 10}
            cursor={!!rawData?.length ? "pointer" : "default"}
            fill={nodeColor}
          />
        </DialogTrigger>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>{payload.name}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[500px] overflow-auto flex flex-col gap-2">
            {rawData?.map(({ initialAllowance, addressId, name }, index) => (
              <div key={index}>
                <div>
                  <Link
                    href={`/allocators/${addressId}`}
                    className={cn(buttonVariants({ variant: "link" }))}
                  >
                    {name ?? addressId}
                  </Link>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Total Datacap:</span>{" "}
                  {convertBytesToIEC(initialAllowance)}
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
        cursor={hasChildren ? "pointer" : "default"}
      >
        {payload.name}
      </text>
    </g>
  );
};

const ColouredLink = (props: {
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
}) => {
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

  let linkColor = getAuditResultColor(payload.target.name);

  if (!linkColor) {
    linkColor = "var(--color-echo-blue)";
  }

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
        fill={linkColor}
        fillOpacity={0.35}
        strokeWidth="0"
      />
    </Layer>
  );
};

export { DataCapFlowSankey };
