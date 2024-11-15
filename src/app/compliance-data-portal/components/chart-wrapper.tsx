import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {TabsSelector} from "@/components/ui/tabs-selector";
import {forwardRef, HTMLAttributes, PropsWithChildren, ReactNode} from "react";
import {ScaleSelector} from "@/app/compliance-data-portal/components/scale-selector";


interface Props extends PropsWithChildren, HTMLAttributes<HTMLDivElement> {
  title: string
  tabs?: string[]
  additionalFilters?: ReactNode[]
  currentTab?: string
  selectedScale: string
  setCurrentTab?: (val: string) => void
  setSelectedScale: (val: string) => void
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
     title, tabs, currentTab, setCurrentTab, children, addons, selectedScale, setSelectedScale, additionalFilters, ...props
   }, ref) => {
  return <div className="w-full mt-2" ref={ref} {...props}>
    <Card>
      <CardHeader>
        <CardTitle className="flex w-full justify-between">
          <div>{title}</div>
          <div className="flex gap-2">
            {additionalFilters?.map((filter, index) => <div key={index}>{filter}</div>)}
            <ScaleSelector selectedScale={selectedScale} setSelectedScale={setSelectedScale}/>
            {(tabs && currentTab&& setCurrentTab) && <TabsSelector tabs={tabs} currentTab={currentTab} setCurrentTab={setCurrentTab}/>}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!!addons?.length && <div className="grid grid-cols-3 gap-2 mb-6">
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
