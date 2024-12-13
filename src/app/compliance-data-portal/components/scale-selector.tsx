import {TabsSelector} from "@/components/ui/tabs-selector";

interface Props {
    selectedScale: string
    setSelectedScale: (val: string) => void
}

const ScaleSelector = ({selectedScale, setSelectedScale}: Props) => {
    return <TabsSelector tabs={['log', 'linear', 'percent']} currentTab={selectedScale} setCurrentTab={setSelectedScale}/>
}

export {ScaleSelector}