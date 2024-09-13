import {useMemo, useState} from 'react';
import {DataCapChild} from "@/lib/hooks/dmob.hooks";
import {convertBytesToIEC} from "@/lib/utils";
import {ResponsiveContainer, Sankey, Tooltip} from "recharts";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import {TooltipProps} from 'recharts';
import {NameType, ValueType} from 'recharts/types/component/DefaultTooltipContent';
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";

interface Props {
  data: DataCapChild[] | undefined
}

export const DataCapFlowSankey = ({
                                    data
                                  }: Props) => {

  const [selectedNodes, setSelectedNodes] = useState([{
    id: 0,
    name: 'Root Key Holder',
  }]);

  const renderTooltip = (props: TooltipProps<ValueType, NameType>) => {
    const linkData = props?.payload?.[0]?.payload?.payload;
    const nodeData = linkData?.target ?? linkData;
    if (!nodeData) {
      return <></>
    }
    const {
      name,
      datacap,
      allocators,
    } = nodeData
    return (<>
      <Card key={name}>
        <CardHeader>
          <CardTitle>
            {name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            {convertBytesToIEC(datacap)} Datacap
          </p>
          {allocators > 0 && <p>
            {allocators} Allocators
          </p>}
        </CardContent>
      </Card>
    </>);
  };

  const handleNodeClick = (data: {
    payload: {
      target: string;
      name: string;
      datacap: number;
      allocators: number;
      isParent: boolean;
      hasChildren: boolean;
      arrayIndex: number;
      children: DataCapChild[];
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
      return
    }

    if (!hasChildren) {
      return
    }

    const arrayIndex = data?.payload?.arrayIndex;

    setSelectedNodes([...selectedNodes, {
      id: arrayIndex,
      name: name,
    }]);
  };

  const handleBackClick = (backIndex: number) => {
    setSelectedNodes(selectedNodes.slice(0, backIndex + 1));
  };

  const sankeyData = useMemo(() => {
    if (!data?.length) {
      return null;
    }

    let currentNode = data[selectedNodes[0].id];
    for (let i = 1; i < selectedNodes.length; i++) {
      currentNode = currentNode!.children![selectedNodes[i].id];
    }

    return {
      nodes: [{
        name: currentNode?.name,
        datacap: currentNode?.attributes?.datacap,
        allocators: currentNode?.attributes?.allocators,
        isParent: selectedNodes.length > 1,
      }, ...currentNode?.children?.map((child, index) => ({
        name: child?.name,
        datacap: child?.attributes?.datacap,
        allocators: child?.attributes?.allocators,
        arrayIndex: index,
        children: child?.children,
        hasChildren: !!child?.children?.map(item => !!item.children?.length).filter(val => val).length
      })) || []],
      links: currentNode?.children?.map((child, index) => ({
        source: 0,
        target: index + 1,
        arrayIndex: index,
        value: child?.attributes?.datacap,
        datacap: child?.attributes?.datacap,
        allocators: child?.attributes?.allocators,
        children: child?.children,
        hasChildren: !!child?.children?.map(item => !!item.children?.length).filter(val => val).length
      })) || []
    }

  }, [data, selectedNodes]);

  return <div>
    <Breadcrumb className="mx-6">
      <BreadcrumbList>
        {
          selectedNodes.map((node, index) => {
            return <>
              {/* eslint-disable-next-line react/jsx-no-undef */}
              <BreadcrumbItem key={index} onClick={() => handleBackClick(index)}>
                {node.name}
              </BreadcrumbItem>
              {
                index < selectedNodes.length - 1 && <BreadcrumbSeparator/>
              }
            </>;
          })
        }
      </BreadcrumbList>
    </Breadcrumb>
    {sankeyData && <ResponsiveContainer width="100%" aspect={2} debounce={100}>
      <Sankey
        width={960}
        height={500}
        data={sankeyData}
        nodePadding={50}
        node={Node}
        margin={{
          left: 200,
          right: 200,
          top: 100,
          bottom: 100
        }}
        onClick={handleNodeClick}
        link={{stroke: 'var(--color-medium-turquoise)'}}
      >
        <Tooltip content={renderTooltip}/>
      </Sankey>
    </ResponsiveContainer>}
  </div>;
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
    hasChildren: boolean;
  };
}

const Node = ({x, y, width, height, payload}: NodeProps) => {
  const hasChildren = payload.hasChildren || payload.isParent;
  return <g transform={`translate(${x},${y})`} style={{cursor: 'pointer'}}>
    <rect x={-width}
          y={-5}
          width={width * 2}
          rx={4}
          height={height + 10}
          cursor={hasChildren ? 'pointer' : 'default'}
          fill={hasChildren ? 'var(--color-dodger-blue)' : 'var(--color-horizon)'}/>
    <text x={width * 1.5} y={height / 2} fill="black" fontSize={12}
          cursor={hasChildren ? 'pointer' : 'default'}>
      {payload.name}
    </text>
  </g>;
};
