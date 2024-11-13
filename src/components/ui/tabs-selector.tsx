import {Tabs, TabsList, TabsTrigger} from "@/components/ui/tabs";

interface Props {
  tabs: string[],
  currentTab: string,
  setCurrentTab: (tab: string) => void
}

const TabsSelector = ({tabs, currentTab, setCurrentTab}: Props) => {

  return <Tabs value={currentTab} onValueChange={setCurrentTab}>
    <TabsList>
      {tabs.map((item) => (
        <TabsTrigger value={item} key={item}>{item}</TabsTrigger>
      ))}
    </TabsList>
  </Tabs>
}

export {TabsSelector};
