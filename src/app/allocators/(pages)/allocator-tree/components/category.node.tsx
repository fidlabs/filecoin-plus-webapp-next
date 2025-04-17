import React from 'react';
import {Handle, NodeProps, Position} from '@xyflow/react';

const CategoryNode = ({data}: NodeProps) => {
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
    </div>
  );
};

export {CategoryNode}