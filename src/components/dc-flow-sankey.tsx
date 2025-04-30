"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IGoogleSheetResponse } from "@/lib/interfaces/cdp/google.interface";
import { IAllocatorsResponse } from "@/lib/interfaces/dmob/allocator.interface";
import { convertBytesToIEC, isPlainObject } from "@/lib/utils";
import Link from "next/link";
import { ReactNode, useCallback, useMemo, useState } from "react";
import { ResponsiveContainer, Sankey, Tooltip, TooltipProps } from "recharts";
import * as z from "zod";

const PIB = BigInt(1000000000000);

interface Node {
  allocators: Array<{
    id: string;
    datacap: bigint;
    name: string;
  }>;
  name: string;
  last: boolean;
  isHidden?: boolean;
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

type OpenedSection =
  | "MPMA"
  | "Direct RKH Automatic"
  | "Direct RKH Manual"
  | undefined;

type Allocator = z.infer<typeof allocatorSchema>;

const acceptedAllocatorTypes = [
  "Automatic",
  "Manual",
  "RFA",
  "Novel allocator not on RFA",
  "Market-based",
  "Manual Pathway MetaAllocator",
] as const;

const acceptedAllocatorPathWays = ["Automatic", "Manual", "RFA", "Manual Pathway MetaAllocator", "Experimental Pathway MetaAllocator"] as const;

const allocatorSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  type: z.enum(acceptedAllocatorTypes),
  pathway: z.enum(acceptedAllocatorPathWays),
  datacap: z.bigint(),
});

function sumAllocatorsDatacap(allocators: Allocator[]): bigint {
  return allocators.reduce(
    (sum, allocator) => sum + allocator.datacap,
    BigInt(0)
  );
}

function* getIndex() {
  let index = 1;
  while (true) {
    yield index++;
  }
}

function prepareAutomaticSankeyData(
  allocators: Allocator[],
  generator: Generator<number>,
  openedSection: OpenedSection
) {
  const [restAllocators, faucetAllocator] = allocators.reduce<
    [Allocator[], Allocator | void]
  >(
    (result, allocator) => {
      const [currentAllocators, currentFaucetAllocator] = result;

      if (allocator.pathway === "RFA" && allocator.type === "RFA") {
        return [currentAllocators, allocator];
      }

      return [[...currentAllocators, allocator], currentFaucetAllocator];
    },
    [[], undefined]
  );

  const totalDatacap = sumAllocatorsDatacap(allocators);
  const restAllocatorsDatacap = sumAllocatorsDatacap(restAllocators);

  const rootId = generator.next().value as number;
  const allocatorsId = generator.next().value as number;

  const sankeyData = {
    nodes: [
      {
        name: "Automatic",
        allocators,
        isHidden: false,
        totalDatacap,
        last: false,
      },
      {
        name: "Direct RKH Automatic",
        isHidden: false,
        allocators: restAllocators,
        totalDatacap: restAllocatorsDatacap,
        last: true,
      },
    ],
    links: [
      { source: 0, target: rootId, value: Number(totalDatacap / PIB) },
      {
        source: rootId,
        target: allocatorsId,
        value: Number(restAllocatorsDatacap / PIB),
      },
    ],
  };

  if (faucetAllocator) {

    const faucetId = generator.next().value as number;

    sankeyData.nodes.push({
      name: "Faucet",
      isHidden: false,
      allocators: [faucetAllocator],
      totalDatacap: faucetAllocator.datacap,
      last: false,
    });
    sankeyData.links.push({
      source: rootId,
      target: faucetId,
      value: Number(faucetAllocator.datacap / PIB),
    });

    if (openedSection !== undefined) {
      sankeyData.nodes.push({
        name: "Faucet Alocators",
        isHidden: true,
        allocators: [],
        totalDatacap: BigInt(0),
        last: false,
      });
      sankeyData.links.push({
        source: faucetId,
        target: generator.next().value as number,
        value: 0.1,
      });
    }
  }

  if (openedSection === "Direct RKH Automatic") {
    for (const allocator of restAllocators) {
      const allocatorId = generator.next().value as number;

      sankeyData.nodes.push({
        name: allocator.name,
        isHidden: false,
        allocators: [allocator],
        totalDatacap: allocator.datacap,
        last: false,
      });
      sankeyData.links.push({
        source: allocatorsId,
        target: allocatorId,
        value: Number(allocator.datacap / PIB),
      });
    }
  } else if (openedSection !== undefined) {
    sankeyData.nodes.push({
      name: "Automatic allocators Alocators",
      isHidden: true,
      allocators: [],
      totalDatacap: BigInt(0),
      last: false,
    });
    sankeyData.links.push({
      source: allocatorsId,
      target: generator.next().value as number,
      value: 0.1,
    });
  }

  return sankeyData;
}

function prepareExperimentalSankeyData(
  allocators: Allocator[],
  generator: Generator<number>,
  openedSection: OpenedSection
) {
  const experimentalPathwayMetaAllocator = allocators[0]
  const experinemtalPathwayId = generator.next().value as number;
  const experinemtalPathwayChildId = generator.next().value as number;

  const sankeyData = {
    nodes: [
      {
        name: "Experimental Pathway MetaAllocator",
        allocators: [],
        isHidden: false,
        totalDatacap: BigInt(
          experimentalPathwayMetaAllocator?.datacap || 0
        ),
        last: false,
      },
      {
        name: "Experimental Pathway MetaAllocator Child",
        isHidden: true,
        allocators: [],
        totalDatacap: BigInt(1),
        last: false,
      },
    ],
    links: [
      {
        source: 0,
        target: experinemtalPathwayId,
        value: Number((experimentalPathwayMetaAllocator?.datacap / PIB) || 0),
      },
      {
        source: experinemtalPathwayId,
        target: experinemtalPathwayChildId,
        value: 1,
      },
    ],
  };

  if (openedSection !== undefined) {
    const experinemtalPathwayChildForOpenedId = generator.next()
      .value as number;

    sankeyData.nodes.push({
      name: "Experimental Pathway MetaAllocator Child Nested",
      isHidden: true,
      allocators: [],
      totalDatacap: BigInt(1),
      last: false,
    });

    sankeyData.links.push({
      source: experinemtalPathwayChildId,
      target: experinemtalPathwayChildForOpenedId,
      value: 1,
    });
  }

  return sankeyData;
}

function prepareManualSankeyData(
  allocators: Allocator[],
  generator: Generator<number>,
  openedSection: OpenedSection
) {
  const metaAllocators = allocators.filter(
    (allocator) => allocator.pathway === "Manual Pathway MetaAllocator"
  );
  const restAllocators = allocators.filter(
    (allocator) => allocator.pathway !== "Manual Pathway MetaAllocator"
  );

  const totalDatacap = sumAllocatorsDatacap(allocators);
  const metaAllocatorDatacap = sumAllocatorsDatacap(metaAllocators);
  const restAllocatorsDatacap = sumAllocatorsDatacap(restAllocators);

  const rootId = generator.next().value as number;
  const metaId = generator.next().value as number;
  const allocatorsId = generator.next().value as number;

  const sankeyData = {
    nodes: [
      {
        name: "Manual",
        isHidden: false,
        allocators,
        totalDatacap,
        last: false,
      },
      {
        name: "MPMA",
        isHidden: false,
        allocators: metaAllocators,
        totalDatacap: metaAllocatorDatacap,
        last: true,
      },
      {
        name: "Direct RKH Manual",
        isHidden: false,
        allocators: restAllocators,
        totalDatacap: restAllocatorsDatacap,
        last: true,
      },
    ],
    links: [
      { source: 0, target: rootId, value: Number(totalDatacap / PIB) },
      { source: rootId,
        target: metaId,
        value: Number(metaAllocatorDatacap / PIB) },
      {
        source: rootId,
        target: allocatorsId,
        value: Number(restAllocatorsDatacap / PIB),
      },
    ],
  };

  if (openedSection === "MPMA") {
    for (const allocator of metaAllocators) {
      const allocatorId = generator.next().value as number;
      sankeyData.nodes.push({
        name: allocator.name,
        isHidden: false,
        allocators: [allocator],
        totalDatacap: allocator.datacap,
        last: false,
      });
      sankeyData.links.push({
        source: metaId,
        target: allocatorId,
        value: Number(allocator.datacap / PIB),
      });
    }
  } else if (openedSection !== undefined) {
    sankeyData.nodes.push({
      name: "MPMA Alocators",
      isHidden: true,
      allocators: [],
      totalDatacap: BigInt(0),
      last: false,
    });
    sankeyData.links.push({
      source: metaId,
      target: generator.next().value as number,
      value: 0.1,
    });
  }

  if (openedSection === "Direct RKH Manual") {
    for (const allocator of restAllocators) {
      const allocatorId = generator.next().value as number;
      sankeyData.nodes.push({
        name: allocator.name,
        isHidden: false,
        allocators: [allocator],
        totalDatacap: allocator.datacap,
        last: false,
      });
      sankeyData.links.push({
        source: allocatorsId,
        target: allocatorId,
        value: Number(allocator.datacap / PIB),
      });
    }
  } else if (openedSection !== undefined) {
    sankeyData.nodes.push({
      name: "Manual Alocators",
      isHidden: true,
      allocators: [],
      totalDatacap: BigInt(0),
      last: false,
    });
    sankeyData.links.push({
      source: allocatorsId,
      target: generator.next().value as number,
      value: 0.1,
    });
  }

  return sankeyData;
}

function loadSankyData(
  sheetData: IGoogleSheetResponse,
  allocatorsData: IAllocatorsResponse,
  openedSection: OpenedSection
): Data {
  const [headerRow, ...rows] = sheetData.values;
  const _allocatorIdIndex = headerRow.indexOf("Allocator ID");
  const _typeOfAllocatorIndex = headerRow.indexOf("Type of Allocator");
  const _pathwayIndex = headerRow.indexOf("Pathway");
  const _pathwayNameIndex = headerRow.indexOf("Pathway Name");

  const allocators = rows
    .map((row) => {
      const allocatorId = row[_allocatorIdIndex];
      const type = row[_typeOfAllocatorIndex];
      const pathway = row[_pathwayIndex];
      const pathwayName = row[_pathwayNameIndex];

      const allocatorData = allocatorsData.data.find(
        (candidateAllocator) =>
          !!allocatorId && candidateAllocator.addressId === allocatorId
      );

      const maybeAllocator = {
        id: allocatorId,
        name: allocatorData?.name || pathwayName || allocatorId,
        type,
        pathway,
        datacap: allocatorData
          ? BigInt(allocatorData.initialAllowance)
          : BigInt(0),
      };

      const result = allocatorSchema.safeParse(maybeAllocator);

      return result.success ? result.data : null;
    })
    .filter(
      (maybeAllocator): maybeAllocator is Allocator => maybeAllocator !== null
    );

  const totalDatacap = sumAllocatorsDatacap(allocators);

  const sankeyData = {
    nodes: [{ name: "Root Key Holder", allocators, totalDatacap, last: false }],
    links: [],
  };

  const indexGenerator = getIndex();

  const automaticData = prepareAutomaticSankeyData(
    allocators.filter((allocator) => ["Automatic", "RFA"].includes(allocator.pathway)),
    indexGenerator,
    openedSection
  );
  const manualData = prepareManualSankeyData(
    allocators.filter((allocator) => allocator.type === "Manual"),
    indexGenerator,
    openedSection
  );

  const experimentalData = prepareExperimentalSankeyData(
    allocators.filter((allocator) => allocator.pathway === "Experimental Pathway MetaAllocator"),
    indexGenerator,
    openedSection
  );

  return {
    nodes: [
      ...sankeyData.nodes,
      ...automaticData.nodes,
      ...manualData.nodes,
      ...experimentalData.nodes,
    ],
    links: [
      ...sankeyData.links,
      ...automaticData.links,
      ...manualData.links,
      ...experimentalData.links,
    ],
  };
}

const Node = ({ x, y, width, height, payload }: NodeProps) => {
  if (isNaN(x) || isNaN(y) || payload.isHidden) {
    return <g transform={`translate(${x},${y})`}></g>;
  }

  const { name, last } = payload;

  return (
    <g transform={`translate(${x},${y})`} style={{ cursor: "pointer" }}>
      <rect
        x={-width}
        y={-5}
        width={width * 2}
        rx={4}
        height={height + 10}
        cursor={!last ? "default" : "pointer"}
        fill={!last ? "var(--color-horizon)" : "var(--color-dodger-blue)"}
      />
      <text
        x={width * 1.5}
        y={height / 2}
        fill="black"
        fontSize={12}
        cursor={!last ? "default" : "pointer"}
      >
        {name}
      </text>
    </g>
  );
};

function isOpenedSection(value: string | undefined): value is OpenedSection {
  return (
    value === "MPMA" ||
    value === "Direct RKH Automatic" ||
    value === "Direct RKH Manual" ||
    value === undefined
  );
}

export interface DCFlowSankeyProps {
  sheetData: IGoogleSheetResponse;
  allocatorsData: IAllocatorsResponse;
}

export function DCFlowSankey({ allocatorsData, sheetData }: DCFlowSankeyProps) {
  const [openedSection, setOpenedSection] = useState<OpenedSection>(undefined);

  const data = useMemo<Data>(() => {
    return loadSankyData(sheetData, allocatorsData, openedSection);
  }, [allocatorsData, sheetData, openedSection]);

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
            {!!nodeData.last && Array.isArray(nodeData.allocators) && (
              <p>{nodeData.allocators.length} Allocators</p>
            )}
          </CardContent>
        </Card>
      );
    },
    []
  );

  const handleClick = (data: {
    payload: {
      name: string;
    };
  }) => {
    const { name } = data.payload;

    if (!isOpenedSection(name)) {
      return;
    }

    setOpenedSection((current) => {
      if (current === name) {
        return undefined;
      }

      return name as OpenedSection;
    });
  };

  const aspect = useMemo(() => {
    switch (openedSection) {
      case "Direct RKH Automatic":
        return 0.9;
      case "MPMA":
        return 0.5;
      case "Direct RKH Manual":
        return 0.5;
      default:
        return 2;
    }
  }, [openedSection]);

  return (
    <ResponsiveContainer width="100%" aspect={aspect}>
      <Sankey
        data={data}
        node={Node}
        nodePadding={50}
        onClick={handleClick}
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
  );
}
