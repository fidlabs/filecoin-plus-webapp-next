import React from 'react';
import {Handle, NodeProps, Position} from '@xyflow/react';

const CategoryNode = ({data}: NodeProps) => {
  return (
    <div className="flex flex-col h-full bg-white rounded-[3px] min-h-[75px] p-2 border border-black">
      <Handle type="target" position={Position.Top} />
      <div className="flex flex-col flex-1 items-center justify-center h-full">
        <p className="text-sm text-center">
          {data['label'] as string}
        </p>
        <p className="text-muted-foreground text-xs text-center">
          {data['datacap'] as string}
        </p>
      </div>
    </div>
  );
};

export {CategoryNode}