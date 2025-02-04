import {TabsSelector} from "@/components/ui/tabs-selector";

interface Props {
    selectedScale: string
    setSelectedScale: (val: string) => void
    scales?: string[]
}

const ScaleSelector = ({selectedScale, setSelectedScale, scales = ['log', 'linear', 'percent']}: Props) => {
    return <TabsSelector tabs={scales} currentTab={selectedScale} setCurrentTab={setSelectedScale}/>
}

export {ScaleSelector}