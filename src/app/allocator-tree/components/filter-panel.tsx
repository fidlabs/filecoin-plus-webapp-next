import {useMediaQuery} from "usehooks-ts";
import {Panel} from "@xyflow/react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Drawer, DrawerContent, DrawerTrigger} from "@/components/ui/drawer";
import {Button} from "@/components/ui/button";
import {SearchIcon} from "lucide-react";
import dynamic from "next/dynamic";
import {useState} from "react";
import {Tabs} from "@radix-ui/react-tabs";
import {TabsList, TabsTrigger} from "@/components/ui/tabs";

interface SearchPanelProps {
  search: string
  onSearchChange: (search: string) => void
  tab: string
  setTab: (tab: string) => void
}

const Component = ({search, onSearchChange, tab, setTab}: SearchPanelProps) => {
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const [drawerOpened, setDrawerOpened] = useState(false)

  return <Panel position="top-left">
    {isDesktop ? <Card>
      <CardHeader>
        <CardTitle>
          Search for Allocator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Input placeholder={'Search for allocator'} value={search} onChange={(e) => onSearchChange(e.target.value)}/>
        <div className="mt-4">
          <Tabs value={tab} className="w-full" onValueChange={setTab}>
            <TabsList>
              <TabsTrigger className="min-w-[80px]" value="all">All</TabsTrigger>
              <TabsTrigger className="min-w-[80px]" value="active">Active</TabsTrigger>
              <TabsTrigger className="min-w-[80px]" value="inactive">Inactive</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardContent>
    </Card> : <Drawer open={drawerOpened} onOpenChange={setDrawerOpened}>
      <DrawerTrigger asChild>
        <Button variant="default" size="icon">
          <SearchIcon/>
        </Button>
      </DrawerTrigger>
      <DrawerContent className="bg-white">
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>
              Search for Allocator
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder={'Search for allocator'}
              onKeyDown={(e) => e.key === 'Enter' && setDrawerOpened(false)}
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}/>
            <div className="mt-4">
              <Tabs value={tab} className="w-full" onValueChange={setTab}>
                <TabsList className="w-full">
                  <TabsTrigger className="flex-1" value="all">All</TabsTrigger>
                  <TabsTrigger className="flex-1" value="active">Active</TabsTrigger>
                  <TabsTrigger className="flex-1" value="inactive">Inactive</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>
      </DrawerContent>
    </Drawer>
    }
  </Panel>
}

const FilterPanel = dynamic(() => Promise.resolve(Component), {ssr: false})

export {FilterPanel}
