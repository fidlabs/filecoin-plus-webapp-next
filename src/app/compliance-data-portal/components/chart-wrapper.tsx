import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {TabsSelector} from "@/components/ui/tabs-selector";
import {forwardRef, HTMLAttributes, PropsWithChildren, ReactNode} from "react";
import {ScaleSelector} from "@/app/compliance-data-portal/components/scale-selector";
import {cn} from "@/lib/utils";


interface Props extends PropsWithChildren, HTMLAttributes<HTMLDivElement> {
  title: string
  tabs?: string[]
  plain?: boolean
  additionalFilters?: ReactNode[]
  currentTab?: string
  selectedScale?: string
  setCurrentTab?: (val: string) => void
  setSelectedScale?: (val: string) => void
  addons?: {
    name: string
    size?: number
    value: ReactNode | string | number
  }[]
}

const ChartWrapper = forwardRef<
  HTMLDivElement,
  Props
>(({
     title, tabs, currentTab, setCurrentTab, children, addons, selectedScale, setSelectedScale, additionalFilters, plain, ...props
   }, ref) => {
  return <div className="w-full" ref={ref} {...props}>
    <Card className={cn(plain && "bg-transparent shadow-none rounded-none")}>
      <CardHeader>
        <CardTitle className="flex w-full flex-col gap-2 md:flex-row flex-wrap justify-between">
          <div>{title}</div>
          <div className="flex flex-col md:flex-row justify-end gap-2">
            {additionalFilters?.map((filter, index) => <div key={index}>{filter}</div>)}
            {(selectedScale && setSelectedScale) && <ScaleSelector selectedScale={selectedScale} setSelectedScale={setSelectedScale}/>}
            {(tabs && currentTab&& setCurrentTab) && <TabsSelector tabs={tabs} currentTab={currentTab} setCurrentTab={setCurrentTab}/>}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!!addons?.length && <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-2 sm:gap-2 mb-6">
          {
            addons?.map((addon, index) => {
              return <Card alternate key={index} className={`col-span-${addon.size ?? 1}`}>
                <CardHeader>
                  <CardTitle>
                    {addon.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
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
