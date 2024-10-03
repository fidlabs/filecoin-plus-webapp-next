import {PropsWithChildren} from "react";
import {Drawer, DrawerContent, DrawerTrigger} from "@/components/ui/drawer";
import {Button} from "@/components/ui/button";
import {InfoIcon} from "lucide-react";

const ResponsiveView = ({ children }: PropsWithChildren) => {

  return <>
    <div className="flex flex-col justify-center items-center md:hidden relative">
      <Drawer shouldScaleBackground={true}>
        <DrawerTrigger asChild>
          <Button className="absolute right-2 bottom-[55px]" variant="outline" size="icon">
            <InfoIcon/>
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          {children}
        </DrawerContent>
      </Drawer>
    </div>
    <div className="hidden md:block">
      {children}
    </div>
  </>
}

export {ResponsiveView}