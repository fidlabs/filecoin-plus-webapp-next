"use client";
import {useEffect, useLayoutEffect, useMemo, useRef, useState} from "react";
import {CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem} from "@/components/ui/command";
import {CommandList} from "cmdk";
import {useRouter} from "next/navigation";
import {getAllocators, getClients, getStorageProviders} from "@/lib/api";
import {IAllocatorsResponse} from "@/lib/interfaces/dmob/allocator.interface";
import {IClientsResponse} from "@/lib/interfaces/dmob/client.interface";
import {IStorageProvidersResponse} from "@/lib/interfaces/dmob/sp.interface";
import {Separator} from "@/components/ui/separator";
import {groupBy} from "lodash";

interface Action {
  group: string
  name: string
  tags: string[]
  link: string
}

type AllSettledResult = [PromiseFulfilledResult<IAllocatorsResponse>, PromiseFulfilledResult<IClientsResponse>, PromiseFulfilledResult<IStorageProvidersResponse>]

function compareTags(arr1: string[], arr2: string[]) {
  return arr2.every(element => arr1.some(tag => tag.toLowerCase().includes(element.toLowerCase())));
}

const defaultActions = [
  {
    name: 'Allocators list',
    group: 'allocators',
    tags: ['allocators', 'allocator', 'list'],
    link: '/allocators'
  }, {
    name: 'Clients list',
    group: 'clients',
    tags: ['clients', 'client', 'list'],
    link: '/clients'
  }, {
    name: 'Storage providers list',
    group: 'storage providers',
    tags: ['storage', 'provider', 'providers', 'sp', 'sps', 'list'],
    link: '/storage-providers'
  }, {
    name: 'Storage providers compliance overview',
    group: 'storage providers',
    tags: ['storage', 'provider', 'providers', 'sp', 'sps', 'compliance'],
    link: '/storage-providers/compliance'
  }, {
    name: 'Allocators compliance',
    group: 'allocators',
    tags: ['allocators', 'allocator', 'compliance'],
    link: '/allocators/compliance'
  }, {
    name: 'Allocators Tree Structure',
    group: 'allocators',
    tags: ['allocators', 'allocator', 'tree', 'structure'],
    link: '/allocators/allocator-tree'
  }, {
    name: "Compliance Data Portal",
    group: 'Compliance Data Porta',
    tags: ['compliance', 'data', 'portal', 'chart', 'cdp'],
    link: '/compliance-data-portal'
  }, {
    name: "Storage providers Retrievability Score",
    group: 'Compliance Data Porta',
    tags: ['compliance', 'data', 'portal', 'chart', 'cdp', 'storage', 'provider', 'providers', 'sp', 'sps', 'compliance', 'retrievability', 'score'],
    link: '/compliance-data-portal?chart=RetrievabilityScoreSP'
  }, {
    name: "Storage providers Number of allocations",
    group: 'Compliance Data Porta',
    tags: ['compliance', 'data', 'portal', 'chart', 'cdp', 'storage', 'provider', 'providers', 'sp', 'sps', 'compliance', 'number', 'of', 'allocations'],
    link: '/compliance-data-portal?chart=NumberOfDealsSP'
  }, {
    name: "Storage providers Biggest allocation",
    group: 'Compliance Data Porta',
    tags: ['compliance', 'data', 'portal', 'chart', 'cdp', 'storage', 'provider', 'providers', 'sp', 'sps', 'compliance', 'biggest', 'deal', 'deals', 'allocation', 'allocations'],
    link: '/compliance-data-portal?chart=BiggestDealsSP'
  }, {
    name: "Storage providers compliance",
    group: 'Compliance Data Porta',
    tags: ['compliance', 'data', 'portal', 'chart', 'cdp', 'storage', 'provider', 'providers', 'sp', 'sps', 'compliance'],
    link: '/compliance-data-portal?chart=ComplianceSP'
  }, {
    name: "Allocators Retrievability Score",
    group: 'Compliance Data Porta',
    tags: ['compliance', 'data', 'portal', 'chart', 'cdp', 'allocator', 'allocators', 'compliance', 'retrievability', 'score'],
    link: '/compliance-data-portal?chart=RetrievabilityScoreAllocator'
  }, {
    name: "Allocator's Size Of The Biggest client allocation",
    group: 'Compliance Data Porta',
    tags: ['compliance', 'data', 'portal', 'chart', 'cdp', 'allocator', 'allocators', 'compliance', 'biggest', 'deal', 'deals', 'allocation', 'allocations'],
    link: '/compliance-data-portal?chart=BiggestDealsAllocator'
  }, {
    name: "Allocator Compliance based on % SP Compliance",
    group: 'Compliance Data Porta',
    tags: ['compliance', 'data', 'portal', 'chart', 'cdp', 'allocator', 'allocators', 'compliance', 'biggest', 'provider', 'providers', 'sp', 'sps', 'compliance'],
    link: '/compliance-data-portal?chart=ProviderComplianceAllocator'
  }, {
    name: "Audit state of the allocators",
    group: 'Compliance Data Porta',
    tags: ['compliance', 'data', 'portal', 'chart', 'cdp', 'allocator', 'allocators', 'audit', 'state', 'compliance'],
    link: '/compliance-data-portal?chart=AuditStateAllocator'
  }, {
    name: "Governance Compliance Audit Outcomes",
    group: 'Compliance Data Porta',
    tags: ['compliance', 'data', 'portal', 'chart', 'cdp', 'allocator', 'allocators', 'audit', 'outcomes', 'trust', 'compliance'],
    link: '/compliance-data-portal?chart=AuditOutcomesAllocator'
  }, {
    name: "About",
    group: 'generic',
    tags: ['about', 'us', 'filecoin', 'plus'],
    link: '/about'
  }
] as Action[]

const GlobalSearchBox = () => {

  const router = useRouter()

  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isMac, setIsMac] = useState<boolean | undefined>(undefined)
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [availableActions, setAvailableActions] = useState<Action[]>([])

  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        toggleOpen()
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  useEffect(() => {
    const timeout = setTimeout(async () => {
      await performSearch(searchQuery)
    }, 350)

    return () => clearTimeout(timeout)
  }, [searchQuery])

  const toggleOpen = () => {
    setAvailableActions([])
    setOpen((open) => !open)
  }

  const performSearch = async (query: string) => {
    if (query.length < 3) {
      setAvailableActions([])
      return
    }
    setIsLoading(true)

    const searchTags = query.split(' ').filter(tag => tag.length > 0)

    const actions = defaultActions.filter(action => {
      return compareTags(action.tags, searchTags)
    })

    const searchParams = {filter: query, limit: '3', page: '1'}

    if (!actions.length) {
      const apiSearch = await Promise.allSettled([
        getAllocators(searchParams),
        getClients(searchParams),
        getStorageProviders(searchParams)
      ]) as AllSettledResult


      apiSearch[0].value.data.forEach((allocator) => {
        actions.push({
          name: `${allocator.name ?? allocator.addressId} - Details`,
          group: `${allocator.name ?? allocator.addressId}`,
          tags: ['allocators', 'allocator', 'details'],
          link: `/allocators/${allocator.addressId}`
        })
        actions.push({
          name: `${allocator.name ?? allocator.addressId} - Allocations over time`,
          group: `${allocator.name ?? allocator.addressId}`,
          tags: ['allocators', 'allocator', 'allocations', 'over', 'time'],
          link: `/allocators/${allocator.addressId}/over-time`
        })
        actions.push({
          name: `${allocator.name ?? allocator.addressId} - Reports`,
          group: `${allocator.name ?? allocator.addressId}`,
          tags: ['allocators', 'allocator', 'reports', 'reporting'],
          link: `/allocators/${allocator.addressId}/reports`
        })
      });

      apiSearch[1].value.data.forEach((client) => {
        actions.push({
          name: `Client Details`,
          group: `${client.name ?? client.addressId}`,
          tags: ['clients', 'client', 'details'],
          link: `/clients/${client.addressId}`
        })
        actions.push({
          name: 'Client providers',
          group: `${client.name ?? client.addressId}`,
          tags: ['allocators', 'allocator', 'providers', 'list'],
          link: `/clients/${client.addressId}/providers`
        })
        actions.push({
          name: 'Client allocations',
          group: `${client.name ?? client.addressId}`,
          tags: ['allocators', 'allocator', 'allocations', 'list'],
          link: `/clients/${client.addressId}/allocations`
        })
        actions.push({
          name: 'Client reports',
          group: `${client.name ?? client.addressId}`,
          tags: ['allocators', 'allocator', 'reports', 'reporting'],
          link: `/clients/${client.addressId}/reports`
        })
      });
    }

    setAvailableActions(actions)
    setIsLoading(false)
  }

  const printActions = useMemo(() => {
    if (!availableActions) return {}
    return groupBy(availableActions, item => item.group)
  }, [availableActions])

  useLayoutEffect(() => {
    setIsMac(navigator.userAgent.includes('Mac'))
  }, []);

  const goTo = (path: string) => {
    setOpen(false)
    if (ref.current) {
      ref!.current!.value = ''
    }
    router.push(path)
  }

  return <>
    <div
      className="flex gap-2 w-32 transition-all cursor-pointer justify-between rounded-md border border-input bg-white px-3 p-2 text-sm ring-offset-background text-muted-foreground hover:bg-muted"
      onClick={toggleOpen}>
      Search
      {isMac !== undefined && <kbd
        className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
      <span className="text-xs">{
        isMac ? '⌘' : 'Ctrl'
      }</span>K
      </kbd>}
    </div>
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput ref={ref} value={searchQuery} onValueChange={(e) => setSearchQuery(e)}
                    placeholder="Type a command or search..."/>
      <CommandList>
        {searchQuery.length < 3 && <CommandEmpty>Type at least 3 characters</CommandEmpty>}
        {searchQuery.length >= 3 && isLoading && <CommandEmpty>Searching...</CommandEmpty>}
        {!availableActions?.length && !isLoading && searchQuery.length >= 3 &&
          <CommandEmpty>No results found</CommandEmpty>}
        {
          Object.keys(printActions).map((group, index) => {
            return <>
              <CommandGroup key={`${group}${index}`} heading={group}>
                {printActions?.[group]?.map((action, itemIndex) => {
                  return <CommandItem key={`${action.name}${index}${itemIndex}`} onSelect={() => goTo(action.link)}>{action.name}</CommandItem>
                })}
              </CommandGroup>
              <Separator/>
            </>
          })
        }
      </CommandList>
    </CommandDialog>
  </>
}

export {GlobalSearchBox}