import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {TabsSelector} from "@/components/ui/tabs-selector";
import {forwardRef, HTMLAttributes, PropsWithChildren, ReactNode, useState} from "react";
import {ScaleSelector} from "@/app/compliance-data-portal/components/scale-selector";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {ChevronDownIcon} from "lucide-react";
import {useMediaQuery} from "usehooks-ts";
import {Drawer, DrawerContent, DrawerTrigger} from "@/components/ui/drawer";


interface Props extends PropsWithChildren, HTMLAttributes<HTMLDivElement> {
  title: string
  tabs?: string[]
  dataTabs?: string[]
  scales?: string[]
  plain?: boolean
  unit?: string,
  additionalFilters?: ReactNode[]
  currentTab?: string
  currentDataTab?: string
  selectedScale?: string
  setCurrentTab?: (val: string) => void
  setCurrentDataTab?: (val: string) => void
  setSelectedScale?: (val: string) => void
  addons?: {
    name: string
    size?: number
    expandable?: boolean
    defaultExpanded?: boolean
    value: ReactNode | string | number
  }[]
}

const ChartWrapper = forwardRef<
  HTMLDivElement,
  Props
>(({
     title,
     tabs,
     dataTabs,
     currentDataTab,
     currentTab,
     setCurrentTab,
     setCurrentDataTab,
     children,
     addons,
     selectedScale,
     scales,
     setSelectedScale,
     additionalFilters,
     plain,
     ...props
   }, ref) => {

  const isDesktop = useMediaQuery("(min-width: 768px)");

  const [expanded, setExpanded] = useState<boolean[]>(addons?.map((addon) => addon.defaultExpanded ?? true) ?? [])

  const toggleExpanded = (index: number) => {
    setExpanded(expanded.map((value, i) => i === index ? !value : value))
  }

  return <div className="w-full" ref={ref} {...props}>
    <Card className={cn(plain && "bg-transparent shadow-none rounded-none")}>
      <CardHeader>
        <CardTitle className="flex w-full flex-col gap-2 md:flex-row flex-wrap justify-between">
          <div>{title}</div>
          <div className="flex flex-col md:flex-row justify-end gap-2">
            {additionalFilters?.map((filter, index) => <div key={index}>{filter}</div>)}
            {(selectedScale && setSelectedScale) &&
              <ScaleSelector selectedScale={selectedScale} setSelectedScale={setSelectedScale} scales={scales}/>}
            {(tabs && currentTab && setCurrentTab) &&
              <TabsSelector tabs={tabs} currentTab={currentTab} setCurrentTab={setCurrentTab}/>}
            {(dataTabs && currentDataTab && setCurrentDataTab) &&
              <TabsSelector tabs={dataTabs} currentTab={currentDataTab} setCurrentTab={setCurrentDataTab}/>}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!!addons?.length && <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-2 sm:gap-2 mb-6">
          {
            addons?.map((addon, index) => {

              // if (addon.expandable) {
              //   return Drawer
              // }

              return <Card alternate key={index} style={{gridColumn: `span ${addon.size ?? 1}`}}>
                <CardHeader>
                  <CardTitle className="w-full flex items-center justify-between">
                    {
                      (isDesktop || !addon.expandable) && <>
                        {addon.name}
                        {addon.expandable && <Button variant="ghost" size="icon" onClick={() => toggleExpanded(index)}>
                          <ChevronDownIcon className={cn(
                            "transition-transform ease-out-expo transition-duration-[0.5s]",
                            expanded[index] ? "transform rotate-180" : ""
                          )}/>
                        </Button>}
                      </>
                    }

                    {
                      !isDesktop && addon.expandable && <Drawer>
                        <DrawerTrigger className="w-full flex items-center justify-between">
                          {addon.name}
                          <ChevronDownIcon/>
                        </DrawerTrigger>
                        <DrawerContent>
                          <div className="p-4">
                            {addon.value}
                          </div>
                        </DrawerContent>
                      </Drawer>
                    }
                  </CardTitle>
                </CardHeader>
                <CardContent className={cn(
                  "transition-[max-height] ease-out-expo transition-duration-[0.5s]",
                  expanded[index] ? "max-h-56" : "max-h-0 overflow-hidden !pb-0",
                  addon.expandable && !isDesktop && "hidden pb-0 md:block md:pb-6"
                )}>
                  {addon.value}
                </CardContent>
              </Card>
            })
          }
        </div>}
        {children}
      </CardContent>
    </Card>
  </div>
})

ChartWrapper.displayName = "ChartWrapper"

export {ChartWrapper}
