import type { ITabNavigatorTab } from "@/components/ui/tab-navigator";

export const allocatorsTabs = [
  {
    label: "Allocators",
    href: "/allocators",
    value: "allocators",
  },
  {
    label: "Tree Structure",
    href: "/allocators/allocator-tree",
    value: "tree",
  },
  {
    label: "DataCap Flow",
    href: "/allocators/dc-flow",
    value: "dc-flow",
  },
] satisfies ITabNavigatorTab[];
