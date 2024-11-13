import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {TabsSelector} from "@/components/ui/tabs-selector";
import {forwardRef, HTMLAttributes, PropsWithChildren} from "react";


interface Props extends PropsWithChildren, HTMLAttributes<HTMLDivElement> {
  title: string
  tabs: string[]
  currentTab: string
  setCurrentTab: (val: string) => void
  addons?: {
    name: string
    value: string
  }[]
}

const ChartWrapper = forwardRef<
  HTMLDivElement,
  Props
>(({
     title, tabs, currentTab, setCurrentTab, children, addons, ...props
   }, ref) => {
  return <div className="w-full mt-2" ref={ref} {...props}>
    <Card>
      <CardHeader>
        <CardTitle className="flex w-full justify-between">
          <div>{title}</div>
          <div className="chartHeaderOptions">
            <TabsSelector tabs={tabs} currentTab={currentTab} setCurrentTab={setCurrentTab}/>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!!addons?.length && <div className="grid grid-cols-3 gap-2 mb-6">
          {
            addons?.map((addon, index) => {
              return <Card alternate key={index}>
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
