import React from 'react';
import {Handle, NodeProps, Position} from '@xyflow/react';

const CategoryParentNode = ({data}: NodeProps) => {
  return (
    <div className="bg-white rounded-[3px] p-2 border border-black">
      <Handle type="target" position={Position.Top} />
      <div>
        <p className="text-sm text-center">
          {data['label'] as string}
        </p>
        <p className="text-muted-foreground text-xs text-center">
          {data['datacap'] as string}
        </p>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export {CategoryParentNode}