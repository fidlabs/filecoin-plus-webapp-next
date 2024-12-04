"use client";
import {IGoogleSheetResponse} from "@/lib/interfaces/cdp/google.interface";
import {useCallback, useMemo, useState} from "react";
import {AllocatorNode} from "./allocator.node";

import {
  ReactFlow,
  Node, Edge, NodeMouseHandler, Background,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {IAllocatorNode} from "@/app/allocator-tree/interfaces/structure.interface";
import {SearchPanel} from "@/app/allocator-tree/components/search-panel";

const nodeTypes = {
  allocatorNode: AllocatorNode,
};

const initialNodes: Node[] = [
  {
    id: 'rkh',
    type: 'input',
    data: {label: 'Root Key Holders'},
    width: 300,
    position: {x: 475, y: 5},
  },
  {
    id: 'manualAllocators',
    data: {label: 'Manual Allocators'},
    width: 200,
    position: {x: 125, y: 100},
  },
  {
    id: 'automaticAllocators',
    data: {label: 'Automatic Allocators'},
    width: 200,
    position: {x: 525, y: 100},
  },
  {
    id: 'marketAllocators',
    data: {label: 'Market Based Allocators'},
    width: 200,
    position: {x: 925, y: 100},
  },
  {
    id: 'manualAllocators-Active',
    data: {label: 'Active'},
    type: 'output',
    width: 150,
    position: {x: 50, y: 200},
  },
  {
    id: 'manualAllocators-Inactive',
    data: {label: 'Inactive'},
    type: 'output',
    width: 150,
    position: {x: 250, y: 200},
  },
  {
    id: 'automaticAllocators-Active',
    data: {label: 'Active'},
    type: 'output',
    width: 150,
    position: {x: 450, y: 200},
  },
  {
    id: 'automaticAllocators-Inactive',
    data: {label: 'Inactive'},
    type: 'output',
    width: 150,
    position: {x: 650, y: 200},
  },
  {
    id: 'marketAllocators-Active',
    data: {label: 'Active'},
    type: 'output',
    width: 150,
    position: {x: 850, y: 200},
  },
  {
    id: 'marketAllocators-Inactive',
    data: {label: 'Inactive'},
    type: 'output',
    width: 150,
    position: {x: 1050, y: 200},
  },
];

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
  }, {
    id: 'manualAllocators-Active',
    source: 'manualAllocators',
    target: 'manualAllocators-Active',
  }, {
    id: 'manualAllocators-Inactive',
    source: 'manualAllocators',
    target: 'manualAllocators-Inactive',
  }, {
    id: 'automaticAllocators-Active',
    source: 'automaticAllocators',
    target: 'automaticAllocators-Active',
  }, {
    id: 'automaticAllocators-Inactive',
    source: 'automaticAllocators',
    target: 'automaticAllocators-Inactive',
  }, {
    id: 'marketAllocators-Active',
    source: 'marketAllocators',
    target: 'marketAllocators-Active',
  }, {
    id: 'marketAllocators-Inactive',
    source: 'marketAllocators',
    target: 'marketAllocators-Inactive',
  }
];

interface IStructureProps {
  auditHistory: IGoogleSheetResponse
  allocatorStatuses: IGoogleSheetResponse
}

const Structure = ({auditHistory, allocatorStatuses}: IStructureProps) => {

  const [search, setSearch] = useState('')

  const parseAllocatorToNode = useCallback((id: string, allocators: IAllocatorNode[], group: number) => ({
    id,
    data: {
      allocators
    },
    type: 'allocatorNode',
    clickable: true,
    width: 150,
    height: 22,
    position: {x: 50 + (200 * group), y: 250},
  } as Node), [])


  const parsedAllocators = useMemo(() => {
    const _allocatorId = allocatorStatuses.values[0].indexOf('Allocator ID');
    const _auditHistoryAllocatorId = auditHistory.values[0].indexOf('Allocator ID');
    const _allocatorName = allocatorStatuses.values[0].indexOf('Allocator Org');
    const _allocatorType = allocatorStatuses.values[0].indexOf('Type of Allocator');

    const _firstReview = auditHistory.values[0].indexOf('1');

    if (_allocatorId < 0 || _auditHistoryAllocatorId < 0) {
      return [];
    }

    const allocatorsMap = [] as IAllocatorNode[];

    for (let i = 1; i < allocatorStatuses.values.length; i++) {
      const currentStatusRow = allocatorStatuses.values[i];
      const historyRow = auditHistory.values.find((historyRow) => historyRow[_auditHistoryAllocatorId] === currentStatusRow[_allocatorId]);

      allocatorsMap.push({
        allocatorId: currentStatusRow[_allocatorId],
        allocatorName: currentStatusRow[_allocatorName],
        isActive: !!historyRow && historyRow[_firstReview] !== 'Inactive',
        allocatorType: currentStatusRow![_allocatorType]
      });
    }

    return allocatorsMap;
  }, [allocatorStatuses.values, auditHistory.values])

  const structureData = useMemo(() => {

    const filteredAllocators = parsedAllocators.filter((item) => item.allocatorName?.toLowerCase().includes(search.toLowerCase() || ''));

    const manualActiveAllocatorsNodes = parseAllocatorToNode('manualAllocators-Active-List', filteredAllocators.filter((item) => item.allocatorType === 'Manual' && item.isActive), 0);
    const manualInactiveAllocatorsNodes = parseAllocatorToNode('manualAllocators-Inactive-List', filteredAllocators.filter((item) => item.allocatorType === 'Manual' && !item.isActive), 1);
    const automaticActiveAllocatorsNodes = parseAllocatorToNode('automaticAllocators-Active-List', filteredAllocators.filter((item) => item.allocatorType === 'Automatic' && item.isActive), 2);
    const automaticInactiveAllocatorsNodes = parseAllocatorToNode('manualAllocators-Inactive-List', filteredAllocators.filter((item) => item.allocatorType === 'Automatic' && !item.isActive), 3);
    const marketActiveAllocatorsNodes = parseAllocatorToNode('marketAllocators-Active-List', filteredAllocators.filter((item) => item.allocatorType === 'Market-based' && item.isActive), 4);
    const marketInactiveAllocatorsNodes = parseAllocatorToNode('marketAllocators-v-List', filteredAllocators.filter((item) => item.allocatorType === 'Market-based' && !item.isActive), 5);

    return [
      ...initialNodes,
      manualActiveAllocatorsNodes,
      manualInactiveAllocatorsNodes,
      automaticActiveAllocatorsNodes,
      automaticInactiveAllocatorsNodes,
      marketActiveAllocatorsNodes,
      marketInactiveAllocatorsNodes
    ];
  }, [parseAllocatorToNode, parsedAllocators, search])

  const onNodeClick: NodeMouseHandler = () => {
  }

  return <div className="w-full h-[calc(100dvh-260px)]">
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
      <SearchPanel search={search} onSearchChange={setSearch}/>
    </ReactFlow>
  </div>
}





export {Structure}