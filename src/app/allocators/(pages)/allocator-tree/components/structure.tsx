"use client";
import '@xyflow/react/dist/style.css';
import {IGoogleSheetResponse} from "@/lib/interfaces/cdp/google.interface";
import {useCallback, useMemo, useState} from "react";
import {AllocatorNode} from "./allocator.node";
import {
  ReactFlow,
  Node, Edge, NodeMouseHandler, Background,
} from '@xyflow/react';
import {IAllocatorNode} from "@/app/allocators/(pages)/allocator-tree/interfaces/structure.interface";
import {IAllocatorsResponse} from "@/lib/interfaces/dmob/allocator.interface";
import {convertBytesToIEC} from "@/lib/utils";
import {CategoryNode} from "@/app/allocators/(pages)/allocator-tree/components/category.node";
import {ITabNavigatorTab} from "@/components/ui/tab-navigator";
import {GenericContentHeader} from "@/components/generic-content-view";
import {Card} from "@/components/ui/card";
import {TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Tabs} from "@radix-ui/react-tabs";

const nodeTypes = {
  allocatorNode: AllocatorNode,
  categoryNode: CategoryNode,
};

const edges: Edge[] = [
  {
    id: 'rkh-manualAllocators',
    source: 'rkh',
    target: 'manualAllocators',
  }, {
    id: 'rkh-automaticAllocators',
    source: 'rkh',
    target: 'automaticAllocators',
  }, {
    id: 'rkh-marketAllocators',
    source: 'rkh',
    target: 'marketAllocators',
  }
];

interface IStructureProps {
  allAllocators: IAllocatorsResponse
  allocatorStatuses: IGoogleSheetResponse
}

const Structure = ({allAllocators, allocatorStatuses}: IStructureProps) => {

  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<string>('all')

  const tabs = [
    {
      label: 'Allocators',
      href: '/allocators',
      value: 'allocators'
    }, {
      label: 'Compliance',
      href: '/allocators/compliance',
      value: 'compliance'
    }, {
      label: 'Tree structure',
      href: '/allocators/allocator-tree',
      value: 'tree'
    }
  ] as ITabNavigatorTab[]

  const parseAllocatorToNode = useCallback((id: string, allocators: IAllocatorNode[], group: number) => ({
    id,
    data: {
      allocators
    },
    type: 'allocatorNode',
    clickable: true,
    width: 200,
    height: 22,
    position: {x: 50 + (125 * group), y: 165},
  } as Node), [])

  const pareIsActiveToBool = useCallback((tab: string, isActive: boolean) => {
    switch (tab) {
      case 'active':
        return isActive;
      case 'inactive':
        return !isActive;
      default:
        return true;
    }
  }, []);

  const parsedAllocators = useMemo(() => {
    const _allocatorId = allocatorStatuses.values[0].indexOf('Allocator ID');
    const _allocatorName = allocatorStatuses.values[0].indexOf('Allocator Org');
    const _allocatorType = allocatorStatuses.values[0].indexOf('Type of Allocator');
    const _allocatorStatus = allocatorStatuses.values[0].indexOf('status');


    if (_allocatorId < 0) {
      return [];
    }

    const allocatorsMap = [] as IAllocatorNode[];

    for (let i = 1; i < allocatorStatuses.values.length; i++) {
      const currentStatusRow = allocatorStatuses.values[i];

      if (!currentStatusRow[_allocatorId]) {
        continue;
      }

      const allocator = allAllocators.data.find((item) => item.addressId === currentStatusRow[_allocatorId]);

      allocatorsMap.push({
        allocatorId: currentStatusRow[_allocatorId],
        allocatorName: currentStatusRow[_allocatorName],
        isActive: !!currentStatusRow[_allocatorStatus] && currentStatusRow[_allocatorStatus].toLowerCase() === 'active',
        allocatorType: currentStatusRow![_allocatorType],
        datacap: allocator?.initialAllowance || '0',
      });
    }

    return allocatorsMap;
  }, [allocatorStatuses.values, allAllocators.data])

  const structureData = useMemo(() => {

    const filteredAllocators = parsedAllocators.filter((item) => item.allocatorName?.toLowerCase().includes(search.toLowerCase() || ''));

    const manualAllocatorsNodes = parseAllocatorToNode('manualAllocators-Active-List', filteredAllocators.filter((item) => item.allocatorType === 'Manual' && pareIsActiveToBool(tab, item.isActive)), 0);
    const automaticAllocatorsNodes = parseAllocatorToNode('automaticAllocators-Active-List', filteredAllocators.filter((item) => item.allocatorType === 'Automatic' && pareIsActiveToBool(tab, item.isActive)), 2);
    const marketAllocatorsNodes = parseAllocatorToNode('marketAllocators-Active-List', filteredAllocators.filter((item) => item.allocatorType === 'Market-based' && pareIsActiveToBool(tab, item.isActive)), 4);

    return [
      {
        id: 'rkh',
        type: 'input',
        data: {label: 'Root Key Holders'},
        width: 300,
        position: {x: 250, y: 5},
      },
      {
        id: 'manualAllocators',
        data: {
          label: 'Manual Allocators',
          datacap: convertBytesToIEC(filteredAllocators.filter((item) => item.allocatorType === 'Manual').reduce((acc, curr) => acc + +curr.datacap, 0))
        },
        width: 200,
        type: 'categoryNode',
        position: {x: 50, y: 100},
      },
      {
        id: 'automaticAllocators',
        data: {
          label: 'Automatic Allocators',
          datacap: convertBytesToIEC(filteredAllocators.filter((item) => item.allocatorType === 'Automatic').reduce((acc, curr) => acc + +curr.datacap, 0))
        },
        width: 200,
        type: 'categoryNode',
        position: {x: 300, y: 100},
      },
      {
        id: 'marketAllocators',
        data: {
          label: 'Market Based Allocators',
          datacap: convertBytesToIEC(filteredAllocators.filter((item) => item.allocatorType === 'Market-based').reduce((acc, curr) => acc + +curr.datacap, 0))
        },
        width: 200,
        type: 'categoryNode',
        position: {x: 550, y: 100},
      },
      automaticAllocatorsNodes,
      manualAllocatorsNodes,
      marketAllocatorsNodes,
    ];
  }, [pareIsActiveToBool, parseAllocatorToNode, parsedAllocators, search, tab])

  const onNodeClick: NodeMouseHandler = () => {
  }

  return <Card className="mt-[50px]">
    <GenericContentHeader placeholder="Allocator name"
                          setQuery={setSearch}
                          selected={tabs[2].value}
                          addons={[
                            <div key="tabs-search">
                              <Tabs value={tab} className="w-full" onValueChange={setTab}>
                                <TabsList>
                                  <TabsTrigger className="min-w-[80px]" value="all">All</TabsTrigger>
                                  <TabsTrigger className="min-w-[80px]" value="active">Active</TabsTrigger>
                                  <TabsTrigger className="min-w-[80px]" value="inactive">Inactive</TabsTrigger>
                                </TabsList>
                              </Tabs>
                            </div>
                          ]}
                          navigation={tabs}/>
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
        <Background/>
      </ReactFlow>
    </div>
  </Card>
}


export {Structure}