import type { ITabNavigatorTab } from "@/components/ui/tab-navigator";

export const allocatorsTabs = [
  {
    label: "Allocators",
    href: "/allocators",
    value: "allocators",
  },
  {
    label: "Allocators tree",
    href: "/allocators/allocator-tree",
    value: "tree",
  },
  {
    label: "Audits Flow",
    href: "/allocators/audit-flow",
    value: "audit-flow",
  },
] satisfies ITabNavigatorTab[];
