"use client";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Separator } from "@/components/ui/separator";
import { getAllocators, getClients, getStorageProviders } from "@/lib/api";
import { IAllocatorsResponse } from "@/lib/interfaces/dmob/allocator.interface";
import { IClientsResponse } from "@/lib/interfaces/dmob/client.interface";
import { IStorageProvidersResponse } from "@/lib/interfaces/dmob/sp.interface";
import { CommandList } from "cmdk";
import { groupBy } from "lodash";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

interface Action {
  group: string;
  name: string;
  tags: string[];
  link: string;
}

type AllSettledResult = [
  PromiseFulfilledResult<IAllocatorsResponse>,
  PromiseFulfilledResult<IClientsResponse>,
  PromiseFulfilledResult<IStorageProvidersResponse>,
];

function compareTags(arr1: string[], arr2: string[]) {
  return arr2.every((element) =>
    arr1.some((tag) => tag.toLowerCase().includes(element.toLowerCase()))
  );
}

const defaultActions = [
  {
    name: "Home",
    group: "Generic",
    tags: [
      "home",
      "state",
      "fil+",
      "filecoin",
      "plus",
      "statistics",
      "metrics",
      "dashboard",
    ],
    link: "/",
  },
  {
    name: "About",
    group: "Generic",
    tags: ["about", "us", "filecoin", "plus"],
    link: "/about",
  },
  {
    name: "Alerts",
    group: "Generic",
    tags: ["alerts", "checks"],
    link: "/alerts",
  },
  {
    name: "Allocators List",
    group: "Allocators",
    tags: ["allocators", "allocator", "list"],
    link: "/allocators",
  },
  {
    name: "Metallocators List",
    group: "Allocators",
    tags: [
      "metaallocators",
      "metaallocator",
      "allocators",
      "allocator",
      "list",
    ],
    link: "/metaallocators",
  },
  {
    name: "Allocators Datacap Flow",
    group: "Allocators",
    tags: [
      "allocators",
      "allocator",
      "datacap",
      "flow",
      "structure",
      "structure flow",
    ],
    link: "/allocators/datacap-flow",
  },
  {
    name: "Allocators Audit Flow",
    group: "Allocators",
    tags: ["allocators", "allocator", "audit", "flow"],
    link: "/allocators/audit-flow",
  },

  {
    name: "Clients list",
    group: "Clients",
    tags: ["clients", "client", "list"],
    link: "/clients",
  },

  {
    name: "Storage Providers List",
    group: "Storage Providers",
    tags: ["storage", "provider", "providers", "sp", "sps", "list"],
    link: "/storage-providers",
  },

  {
    name: "Compliance Data Portal - Allocators Retrievability",
    group: "Compliance Data Portal - Allocators",
    tags: [
      "compliance",
      "data",
      "portal",
      "chart",
      "cdp",
      "allocators",
      "retrievability",
    ],
    link: "/compliance-data-portal/allocators/retrievability",
  },
  {
    name: "Compliance Data Portal - Allocators Biggest Deals",
    group: "Compliance Data Portal - Allocators",
    tags: [
      "compliance",
      "data",
      "portal",
      "chart",
      "cdp",
      "allocators",
      "biggest",
      "deals",
    ],
    link: "/compliance-data-portal/allocators/biggest-deals",
  },
  {
    name: "Compliance Data Portal - Allocators Providers Compliance",
    group: "Compliance Data Portal - Allocators",
    tags: [
      "compliance",
      "data",
      "portal",
      "chart",
      "cdp",
      "allocators",
      "providers",
      "compliance",
    ],
    link: "/compliance-data-portal/allocators/providers-compliance",
  },
  {
    name: "Compliance Data Portal - Allocators Audit State",
    group: "Compliance Data Portal - Allocators",
    tags: [
      "compliance",
      "data",
      "portal",
      "chart",
      "cdp",
      "allocators",
      "audit",
      "state",
    ],
    link: "/compliance-data-portal/allocators/audit-state",
  },
  {
    name: "Compliance Data Portal - Allocators Audit Outcomes",
    group: "Compliance Data Portal - Allocators",
    tags: [
      "compliance",
      "data",
      "portal",
      "chart",
      "cdp",
      "allocators",
      "audit",
      "outcomes",
    ],
    link: "/compliance-data-portal/allocators/audit-outcomes",
  },
  {
    name: "Compliance Data Portal - Allocators Audit Timeline",
    group: "Compliance Data Portal - Allocators",
    tags: [
      "compliance",
      "data",
      "portal",
      "chart",
      "cdp",
      "allocators",
      "audit",
      "timeline",
    ],
    link: "/compliance-data-portal/allocators/audit-timeline",
  },
  {
    name: "Compliance Data Portal - Allocators Client Diversity",
    group: "Compliance Data Portal - Allocators",
    tags: [
      "compliance",
      "data",
      "portal",
      "chart",
      "cdp",
      "allocators",
      "client",
      "diversity",
    ],
    link: "/compliance-data-portal/allocators/client-diversity",
  },

  {
    name: "Compliance Data Portal - Old DataCap Owned by Entities",
    group: "Compliance Data Portal - Old DataCap",
    tags: [
      "compliance",
      "data",
      "portal",
      "chart",
      "cdp",
      "old",
      "datacap",
      "owned",
      "entities",
    ],
    link: "/compliance-data-portal/old-datacap/owned-by-entities",
  },
  {
    name: "Compliance Data Portal - Old DataCap Allocated to Clients",
    group: "Compliance Data Portal - Old DataCap",
    tags: [
      "compliance",
      "data",
      "portal",
      "chart",
      "cdp",
      "old",
      "datacap",
      "allocated",
      "clients",
    ],
    link: "/compliance-data-portal/old-datacap/allocated-to-clients",
  },
  {
    name: "Compliance Data Portal - Old DataCap Owned by Clients",
    group: "Compliance Data Portal - Old DataCap",
    tags: [
      "compliance",
      "data",
      "portal",
      "chart",
      "cdp",
      "old",
      "datacap",
      "owned",
      "clients",
    ],
    link: "/compliance-data-portal/old-datacap/owned-by-clients",
  },
  {
    name: "Compliance Data Portal - Old DataCap Spent by Clients",
    group: "Compliance Data Portal - Old DataCap",
    tags: [
      "compliance",
      "data",
      "portal",
      "chart",
      "cdp",
      "old",
      "datacap",
      "spent",
      "clients",
    ],
    link: "/compliance-data-portal/old-datacap/spent-by-clients",
  },

  {
    name: "Compliance Data Portal - Storage Providers Compliance",
    group: "Compliance Data Portal - Storage Providers",
    tags: [
      "compliance",
      "data",
      "portal",
      "chart",
      "cdp",
      "storage",
      "providers",
      "compliance",
    ],
    link: "/compliance-data-portal/storage-providers/compliance",
  },
  {
    name: "Compliance Data Portal - Storage Providers Retrievability",
    group: "Compliance Data Portal - Storage Providers",
    tags: [
      "compliance",
      "data",
      "portal",
      "chart",
      "cdp",
      "storage",
      "providers",
      "retrievability",
    ],
    link: "/compliance-data-portal/storage-providers/retrievability",
  },
  {
    name: "Compliance Data Portal - Storage Providers Number of Deals",
    group: "Compliance Data Portal - Storage Providers",
    tags: [
      "compliance",
      "data",
      "portal",
      "chart",
      "cdp",
      "storage",
      "providers",
      "number",
      "deals",
    ],
    link: "/compliance-data-portal/storage-providers/number-of-deals",
  },
  {
    name: "Compliance Data Portal - Storage Providers Biggest Deals",
    group: "Compliance Data Portal - Storage Providers",
    tags: [
      "compliance",
      "data",
      "portal",
      "chart",
      "cdp",
      "storage",
      "providers",
      "biggest",
      "deals",
    ],
    link: "/compliance-data-portal/storage-providers/biggest-deals",
  },
  {
    name: "Compliance Data Portal - Storage Providers IPNI Misreporting",
    group: "Compliance Data Portal - Storage Providers",
    tags: [
      "compliance",
      "data",
      "portal",
      "chart",
      "cdp",
      "storage",
      "providers",
      "ipni",
      "misreporting",
    ],
    link: `/compliance-data-portal/storage-providers/ipni-misreporting`,
  },
  {
    name: "Compliance Data Portal - Storage Providers Client Diversity",
    group: "Compliance Data Portal - Storage Providers",
    tags: [
      "compliance",
      "data",
      "portal",
      "chart",
      "cdp",
      "storage",
      "providers",
      "client",
      "diversity",
    ],
    link: "/compliance-data-portal/storage-providers/client-diversity",
  },
] as Action[];

const GlobalSearchBox = () => {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMac, setIsMac] = useState<boolean | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [availableActions, setAvailableActions] = useState<Action[]>([]);

  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleOpen();
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      await performSearch(searchQuery);
    }, 350);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const toggleOpen = () => {
    setAvailableActions([]);
    setOpen((open) => !open);
  };

  const performSearch = async (query: string) => {
    if (query.length < 3) {
      setAvailableActions([]);
      return;
    }
    setIsLoading(true);

    const searchTags = query.split(" ").filter((tag) => tag.length > 0);

    const actions = defaultActions.filter((action) => {
      return compareTags(action.tags, searchTags);
    });

    const searchParams = { filter: query, limit: "3", page: "1" };

    if (!actions.length) {
      const apiSearch = (await Promise.allSettled([
        getAllocators(searchParams),
        getClients(searchParams),
        getStorageProviders(searchParams),
      ])) as AllSettledResult;

      apiSearch[0].value.data.forEach((allocator) => {
        actions.push({
          name: `${allocator.name ?? allocator.addressId} - Details`,
          group: `${allocator.name ?? allocator.addressId}`,
          tags: ["allocators", "allocator", "details"],
          link: `/allocators/${allocator.addressId}`,
        });
        actions.push({
          name: `${
            allocator.name ?? allocator.addressId
          } - Allocations over time`,
          group: `${allocator.name ?? allocator.addressId}`,
          tags: ["allocators", "allocator", "allocations", "over", "time"],
          link: `/allocators/${allocator.addressId}/over-time`,
        });
        actions.push({
          name: `${allocator.name ?? allocator.addressId} - Reports`,
          group: `${allocator.name ?? allocator.addressId}`,
          tags: ["allocators", "allocator", "reports", "reporting"],
          link: `/allocators/${allocator.addressId}/reports`,
        });
      });

      apiSearch[1].value.data.forEach((client) => {
        actions.push({
          name: `Client Details`,
          group: `${client.name ?? client.addressId}`,
          tags: ["clients", "client", "details"],
          link: `/clients/${client.addressId}`,
        });
        actions.push({
          name: "Client providers",
          group: `${client.name ?? client.addressId}`,
          tags: ["allocators", "allocator", "providers", "list"],
          link: `/clients/${client.addressId}/providers`,
        });
        actions.push({
          name: "Client allocations",
          group: `${client.name ?? client.addressId}`,
          tags: ["allocators", "allocator", "allocations", "list"],
          link: `/clients/${client.addressId}/allocations`,
        });
        actions.push({
          name: "Client reports",
          group: `${client.name ?? client.addressId}`,
          tags: ["allocators", "allocator", "reports", "reporting"],
          link: `/clients/${client.addressId}/reports`,
        });
      });
    }

    setAvailableActions(actions);
    setIsLoading(false);
  };

  const printActions = useMemo(() => {
    if (!availableActions) return {};
    return groupBy(availableActions, (item) => item.group);
  }, [availableActions]);

  useLayoutEffect(() => {
    setIsMac(navigator.userAgent.includes("Mac"));
  }, []);

  const goTo = (path: string) => {
    setOpen(false);
    if (ref.current) {
      ref!.current!.value = "";
    }
    router.push(path);
  };

  return (
    <>
      <div
        className="flex gap-2 w-32 transition-all cursor-pointer justify-between rounded-md border border-input bg-white px-3 p-2 text-sm ring-offset-background text-muted-foreground hover:bg-muted"
        onClick={toggleOpen}
      >
        Search
        {isMac !== undefined && (
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">{isMac ? "⌘" : "Ctrl"}</span>K
          </kbd>
        )}
      </div>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          ref={ref}
          value={searchQuery}
          onValueChange={(e) => setSearchQuery(e)}
          placeholder="Type a command or search..."
        />
        <CommandList>
          {searchQuery.length < 3 && (
            <CommandEmpty>Type at least 3 characters</CommandEmpty>
          )}
          {searchQuery.length >= 3 && isLoading && (
            <CommandEmpty>Searching...</CommandEmpty>
          )}
          {!availableActions?.length &&
            !isLoading &&
            searchQuery.length >= 3 && (
              <CommandEmpty>No results found</CommandEmpty>
            )}
          {Object.keys(printActions).map((group, index) => {
            return (
              <div key={index}>
                <CommandGroup key={`${group}${index}`} heading={group}>
                  {printActions?.[group]?.map((action, itemIndex) => {
                    return (
                      <CommandItem
                        key={`${action.name}${index}${itemIndex}`}
                        onSelect={() => goTo(action.link)}
                      >
                        {action.name}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
                <Separator />
              </div>
            );
          })}
        </CommandList>
      </CommandDialog>
    </>
  );
};

export { GlobalSearchBox };
