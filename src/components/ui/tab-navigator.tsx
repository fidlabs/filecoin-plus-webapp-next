import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { DynamicHeading } from "@/components/ui/dynamic-heading";
import { ReactNode } from "react";

export interface ITabNavigatorTab {
  label: ReactNode | string;
  href: string;
  value: string;
}

interface ITabNavigatorProps {
  tabs: ITabNavigatorTab[];
  selected: string;
}

const TabNavigator = ({ tabs, selected }: ITabNavigatorProps) => {
  return (
    <>
      <Tabs value={selected} className="hidden md:block">
        <TabsList>
          {tabs.map(({ label, href, value }, index) => (
            <TabsTrigger key={index} asChild value={value}>
              <Link
                href={href}
                className={cn({ "pointer-events-none": selected === value })}
              >
                <DynamicHeading
                  isHeader={selected === value}
                  className="text-xl font-normal text-black leading-none flex items-center gap-2"
                >
                  {label}
                </DynamicHeading>
              </Link>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <div className="flex gap-6 items-center justify-between md:hidden">
        <h1 className="flex text-xl gap-2">
          {tabs.find(({ value }) => value === selected)?.label}
        </h1>
      </div>
    </>
  );
};

export { TabNavigator };
