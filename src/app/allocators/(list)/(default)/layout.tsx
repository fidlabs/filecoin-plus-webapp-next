import { TabNavigator } from "@/components/ui/tab-navigator";
import { PropsWithChildren } from "react";
import { allocatorsTabs } from "../../constants";
import { AllocatorsListAddons } from "../../components/allocators-list-addons";

export default function AllocatorsListDefaultLayout({
  children,
}: PropsWithChildren) {
  return (
    <>
      <div className="px-4 pt-6 flex flex-wrap justify-between gap-4">
        <TabNavigator
          tabs={allocatorsTabs}
          selected={allocatorsTabs[0].value}
        />
        <AllocatorsListAddons className="flex-1 justify-end" />
      </div>
      {children}
    </>
  );
}
