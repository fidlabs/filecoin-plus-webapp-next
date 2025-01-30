import React from 'react';
import {NodeProps} from '@xyflow/react';
import {IAllocatorNode} from "@/app/allocators/(pages)/allocator-tree/interfaces/structure.interface";
import Link from "next/link";

const AllocatorNodeList = ({allocators}: { allocators: IAllocatorNode[] }) => {
  return (
    <div className="flex flex-col gap-1">
      {allocators.map((allocator) => (
        <Link href={`/allocators/${allocator.allocatorId}`} key={allocator.allocatorId}
              target={"_blank"} rel={"noopener noreferrer"}
              className="text-xs shadow-structure-inset shadow-dodger-blue rounded-[2px] text-wrap overflow-hidden p-1 hover:bg-white">
          {allocator.allocatorName}
        </Link>
      ))}
    </div>
  );
}

const AllocatorNode = ({data}: NodeProps) => {
  return (
    <div>
      <AllocatorNodeList allocators={data.allocators as IAllocatorNode[]}/>
    </div>
  );
};

export {AllocatorNode}