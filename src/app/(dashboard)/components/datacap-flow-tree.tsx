import {useEffect, useState} from 'react';
import Tree, {CustomNodeElementProps} from 'react-d3-tree';
import {DataCapChild} from "@/lib/hooks/dmob.hooks";
import {convertBytesToIEC} from "@/lib/utils";

interface Props {
  data: DataCapChild[] | undefined
}

export const DataCapFlowTree = ({
                                  data
                                }: Props) => {

  const [dimensions, setDimensions] = useState({
    width: 0, height: 0
  });

  const [translation, setTranslation] = useState({
    x: 0, y: 0
  });

  const [treeChartContainerRef, setTreeChartContainerRef] = useState<HTMLDivElement | undefined>(undefined);

  const render = (props: CustomNodeElementProps) => (
    <TreeNode props={props}/>
  );

  useEffect(() => {
    if (treeChartContainerRef?.getBoundingClientRect) {
      const dimensions = treeChartContainerRef.getBoundingClientRect();
      setDimensions(dimensions);
      setTranslation({
        x: dimensions.width / 4,
        y: dimensions.height / 2
      });
    }
  }, [treeChartContainerRef]);

  return <div>
    {!!data?.length && <div>
      <div ref={(ref) => setTreeChartContainerRef(ref ?? undefined)} id="treeWrapper" style={{width: '100%', height: '950px'}}>
        <Tree data={data}
              initialDepth={1}
              separation={{siblings: 0.66, nonSiblings: 1}}
              nodeSize={{x: 200, y: 200}}
              dimensions={dimensions}
              translate={translation}
              zoomable={false}
              collapsible={true}
              depthFactor={400}
              pathFunc='diagonal'
              pathClassFunc={() => 'stroke-[0.2]'}
              renderCustomNodeElement={render}
              shouldCollapseNeighborNodes={true}/>
      </div>
    </div>}
  </div>;
};

const TreeNode = ({props}: {props: CustomNodeElementProps}) => {

  const {
    nodeDatum,
    toggleNode
  } = props
  return (
    <>
      <circle className={!!nodeDatum.children?.length ? "fill-medium-turquoise stroke-dodger-blue stroke-1" : "fill-white stroke-dodger-blue stroke-1"} r={15}
              onClick={toggleNode}></circle>
      <g className="rd3t-label">
        <text
          className="text-[16px] leading-[18px] font-thin fill-black m-0 stroke-[0.5]"
          textAnchor="start"
          fontWeight={400}
          x="-20"
          y="35"
        >
          {nodeDatum.name}
        </text>
        <text className="text-[14px] leading-[16px] font-thin fill-dodger-blue m-0 stroke-[0.3]" x="-20" y="35">
          {nodeDatum.attributes &&
            Object.entries(nodeDatum.attributes).map(([labelKey, labelValue], i) => {
              if (labelKey !== 'id') {
                return (
                  <tspan key={`${labelKey}-${i}`} x="-20" dy="1.2em">
                    {labelKey}: {labelKey === 'datacap' ? convertBytesToIEC(labelValue) : labelValue}
                  </tspan>
                )
              }
            })}
        </text>
        {!!nodeDatum?.attributes?.id && <text
          className="text-[16px] leading-[18px] font-thin fill-mountain-meadow m-0 stroke-[0.4] cursor-pointer hover:underline hover:underline-offset-2"
          textAnchor="start"
          fontWeight={400}
          x="-20"
          y="70"
          onClick={() => {
            window.open(`notaries\\${nodeDatum?.attributes?.id}`, '_blank');
          }}
        >
          See details
        </text>}
      </g>
    </>
  );
};
