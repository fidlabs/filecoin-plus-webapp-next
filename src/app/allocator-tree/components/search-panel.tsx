import {useMediaQuery} from "usehooks-ts";
import {Panel} from "@xyflow/react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Drawer, DrawerContent, DrawerTrigger} from "@/components/ui/drawer";
import {Button} from "@/components/ui/button";
import {SearchIcon} from "lucide-react";
import dynamic from "next/dynamic";
import {useState} from "react";

interface SearchPanelProps {
  search: string
  onSearchChange: (search: string) => void
}

const Component = ({search, onSearchChange}: SearchPanelProps) => {
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
          </CardContent>
        </Card>
      </DrawerContent>
    </Drawer>
    }
  </Panel>
}

const SearchPanel = dynamic(() => Promise.resolve(Component), {ssr: false})

export {SearchPanel}
