import type { ITabNavigatorTab } from "@/components/ui/tab-navigator";

export const allocatorsTabs = [
  {
    label: "Allocators",
    href: "/allocators",
    value: "allocators",
  },
  {
    label: "Datacap Flow",
    href: "/allocators/datacap-flow",
    value: "tree",
  },
  {
    label: "Audits Flow",
    href: "/allocators/audit-flow",
    value: "audit-flow",
  },
] satisfies ITabNavigatorTab[];
