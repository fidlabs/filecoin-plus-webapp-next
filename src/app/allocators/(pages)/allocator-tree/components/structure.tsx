"use client";

import { CategoryNode } from "@/app/allocators/(pages)/allocator-tree/components/category.node";
import { IAllocatorNode } from "@/app/allocators/(pages)/allocator-tree/interfaces/structure.interface";
import { allocatorsTabs } from "@/app/allocators/constants";
import { GenericContentHeader } from "@/components/generic-content-view";
import { Card } from "@/components/ui/card";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IGoogleSheetResponse } from "@/lib/interfaces/cdp/google.interface";
import { IAllocatorsResponse } from "@/lib/interfaces/dmob/allocator.interface";
import { convertBytesToIEC } from "@/lib/utils";
import { Tabs } from "@radix-ui/react-tabs";
import {
  Background,
  Edge,
  Node,
  NodeMouseHandler,
  ReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useMemo, useState } from "react";
import { AllocatorNode } from "./allocator.node";
import {CategoryParentNode} from "@/app/allocators/(pages)/allocator-tree/components/category-parent.node";

const nodeTypes = {
  allocatorNode: AllocatorNode,
  categoryNode: CategoryNode,
  categoryParentNode: CategoryParentNode,
};

const edges: Edge[] = [
  {
    id: "rkh-manualAllocators",
    source: "rkh",
    target: "manualAllocators",
  },
  {
    id: "rkh-automaticAllocators",
    source: "rkh",
    target: "automaticAllocators",
  },
  {
    id: "rkh-other",
    source: "rkh",
    target: "other",
  },
  {
    id: 'manual-direct',
    source: 'manualAllocators',
    target: 'manualAllocatorsDirect',
  },
  {
    id: 'manual-mpma',
    source: 'manualAllocators',
    target: 'manualAllocatorsMPMA',
  },
  {
    id: 'auto-direct',
    source: 'automaticAllocators',
    target: 'automaticAllocatorsDirect',
  },
  {
    id: 'auto-mpma',
    source: 'automaticAllocators',
    target: 'automaticAllocatorsFaucet',
  },
  {
    id: 'other-market',
    source: 'other',
    target: 'marketAllocators',
  },
  {
    id: 'other-experimentalPathwayMetaAllocator',
    source: 'other',
    target: 'experimentalPathwayMetaAllocator',
  },
];

interface IStructureProps {
  allAllocators: IAllocatorsResponse;
  allocatorStatuses: IGoogleSheetResponse;
}

const Structure = ({ allAllocators, allocatorStatuses }: IStructureProps) => {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<string>("all");

  const parseAllocatorToNode = useCallback(
    (id: string, allocators: IAllocatorNode[], group: number) =>
      ({
        id,
        data: {
          allocators,
        },
        type: "allocatorNode",
        clickable: true,
        width: 200,
        height: 22,
        position: { x: 225 * group + 25 * Math.floor(group/2), y: 285 },
      } as Node),
    []
  );

  const pareIsActiveToBool = useCallback((tab: string, isActive: boolean) => {
    switch (tab) {
      case "active":
        return isActive;
      case "inactive":
        return !isActive;
      default:
        return true;
    }
  }, []);

  const parsedAllocators = useMemo(() => {
    const [header, ...values] = allocatorStatuses.values;

    const _allocatorId = header.indexOf("Allocator ID");
    const _allocatorName = header.indexOf("Allocator Org");
    const _allocatorType = header.indexOf("Type of Allocator");
    const _pathwayIndex = header.indexOf("Pathway");

    const _allocatorStatus = header.indexOf("status");

    if (_allocatorId < 0) {
      return [];
    }

    const allocatorsMap = [] as IAllocatorNode[];

    for (let i = 0; i < values.length; i++) {
      const currentStatusRow = values[i];

      if (!currentStatusRow[_allocatorId]) {
        continue;
      }

      const allocator = allAllocators.data.find(
        (item) => item.addressId === currentStatusRow[_allocatorId]
      );

      allocatorsMap.push({
        allocatorId: currentStatusRow[_allocatorId],
        allocatorName: currentStatusRow[_allocatorName],
        isActive:
          !!currentStatusRow[_allocatorStatus] &&
          currentStatusRow[_allocatorStatus].toLowerCase() === "active",
        allocatorType: currentStatusRow[_allocatorType],
        pathway: currentStatusRow[_pathwayIndex],
        datacap: allocator?.initialAllowance || "0",
      });
    }

    return allocatorsMap;
  }, [allocatorStatuses.values, allAllocators.data]);

  const structureData = useMemo(() => {

    const experimentalPathwayMetaAllocator = allAllocators.data.find(allocator => allocator.addressId = 'f03521515')

    const filteredAllocators = parsedAllocators.filter((item) =>
      item.allocatorName?.toLowerCase().includes(search.toLowerCase() || "")
    );

    const manualDirectAllocatorsNodes = parseAllocatorToNode(
      "manualAllocators-Direct-List",
      filteredAllocators.filter(
        (item) =>
          item.allocatorType === "Manual" &&
          item.pathway === 'Manual' &&
          pareIsActiveToBool(tab, item.isActive)
      ),
      0
    );

    const manualMPMAAllocatorsNodes = parseAllocatorToNode(
      "manualAllocators-MPMA-List",
      filteredAllocators.filter(
        (item) =>
          item.allocatorType === "Manual Pathway MetaAllocator" &&
          item.pathway === 'Manual' &&
          pareIsActiveToBool(tab, item.isActive)
      ),
      1
    );

    const automaticAllocatorsNodes = parseAllocatorToNode(
      "automaticAllocators-Active-List",
      filteredAllocators.filter(
        (item) =>
          item.allocatorType === "Automatic" &&
          item.pathway === "Automatic" &&
          pareIsActiveToBool(tab, item.isActive)
      ),
      2
    );
    const marketAllocatorsNodes = parseAllocatorToNode(
      "marketAllocators-Active-List",
      filteredAllocators.filter(
        (item) =>
          item.allocatorType === "Market-based" &&
          pareIsActiveToBool(tab, item.isActive)
      ),
      4
    );

    return [
      {
        id: "rkh",
        type: "input",
        data: { label: "Root Key Holders" },
        width: 300,
        position: { x: 540, y: 5 },
      },
      {
        id: "manualAllocators",
        data: {
          label: "Manual Allocators",
          datacap: convertBytesToIEC(
            filteredAllocators
              .filter((item) => item.pathway === "Manual")
              .reduce((acc, curr) => acc + +curr.datacap, 0)
          ),
        },
        width: 200,
        type: "categoryParentNode",
        position: { x: 115, y: 100 },
      },
      {
        id: "automaticAllocators",
        data: {
          label: "Automatic Allocators",
          datacap: convertBytesToIEC(
            filteredAllocators
              .filter((item) => item.pathway === "Automatic")
              .reduce((acc, curr) => acc + +curr.datacap, 0)
          ),
        },
        width: 200,
        type: "categoryParentNode",
        position: { x: 590, y: 100 },
      },
      {
        id: "other",
        data: {
          label: "Other",
        },
        width: 200,
        position: { x: 1065, y: 100 },
      },
      {
        id: "experimentalPathwayMetaAllocator",
        data: {
          label: experimentalPathwayMetaAllocator?.name,
          datacap: convertBytesToIEC(experimentalPathwayMetaAllocator?.initialAllowance)
        },
        width: 200,
        type: "categoryNode",
        position: { x: 1175, y: 200 },
      },
      {
        id: "marketAllocators",
        data: {
          label: "Market Based Allocators",
          datacap: convertBytesToIEC(
            filteredAllocators
              .filter((item) => item.pathway === "Market-based")
              .reduce((acc, curr) => acc + +curr.datacap, 0)
          ),
        },
        width: 200,
        type: "categoryNode",
        position: { x: 950, y: 200 },
      },
      {
        id: "manualAllocatorsDirect",
        data: {
          label: "Direct",
          datacap: convertBytesToIEC(
            filteredAllocators
              .filter((item) => item.allocatorType === "Manual" && item.pathway === "Manual")
              .reduce((acc, curr) => acc + +curr.datacap, 0)
          ),
        },
        width: 200,
        type: "categoryNode",
        position: { x: 0, y: 200 },
      },
      {
        id: "manualAllocatorsMPMA",
        data: {
          label: "MPMA",
          datacap: convertBytesToIEC(
            filteredAllocators
              .filter((item) => item.allocatorType === "Manual Pathway MetaAllocator" && item.pathway === "Manual")
              .reduce((acc, curr) => acc + +curr.datacap, 0)
          ),
        },
        width: 200,
        type: "categoryNode",
        position: { x: 225, y: 200 },
      },
      {
        id: "automaticAllocatorsDirect",
        data: {
          label: "Direct",
          datacap: convertBytesToIEC(
            filteredAllocators
              .filter((item) => item.allocatorType === "Automatic" && item.pathway === "Automatic")
              .reduce((acc, curr) => acc + +curr.datacap, 0)
          ),
        },
        width: 200,
        type: "categoryNode",
        position: { x: 475, y: 200 },
      },
      {
        id: "automaticAllocatorsFaucet",
        data: {
          label: "Faucet",
        },
        width: 200,
        type: "categoryNode",
        position: { x: 700, y: 200 },
      },
      manualDirectAllocatorsNodes,
      manualMPMAAllocatorsNodes,
      automaticAllocatorsNodes,
      marketAllocatorsNodes
    ];
  }, [allAllocators.data, pareIsActiveToBool, parseAllocatorToNode, parsedAllocators, search, tab]);

  const onNodeClick: NodeMouseHandler = () => {};

  return (
    <Card className="mt-[50px]">
      <GenericContentHeader
        placeholder="Allocator name"
        setQuery={setSearch}
        selected={allocatorsTabs[1].value}
        addons={[
          <div key="tabs-search">
            <Tabs value={tab} className="w-full" onValueChange={setTab}>
              <TabsList>
                <TabsTrigger className="min-w-[80px]" value="all">
                  All
                </TabsTrigger>
                <TabsTrigger className="min-w-[80px]" value="active">
                  Active
                </TabsTrigger>
                <TabsTrigger className="min-w-[80px]" value="inactive">
                  Inactive
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>,
        ]}
        navigation={allocatorsTabs}
      />
      <div className="w-full h-[calc(100dvh-300px)]">
        <ReactFlow
          nodes={structureData}
          edges={edges}
          nodeTypes={nodeTypes}
          elementsSelectable={false}
          nodesConnectable={false}
          nodesDraggable={false}
          onNodeClick={onNodeClick}
          fitView
        >
          <Background />
        </ReactFlow>
      </div>
    </Card>
  );
};

export { Structure };