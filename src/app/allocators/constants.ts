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
    label: "Audits Flow",
    href: "/allocators/audit-flow",
    value: "audit-flow",
  },
  {
    label: "Audits Tree",
    href: "/allocators/audit-tree",
    value: "audit-tree",
  },
] satisfies ITabNavigatorTab[];
