"use client";
import {useEffect, useLayoutEffect, useState} from "react";
import {CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem} from "@/components/ui/command";
import {CommandList} from "cmdk";
import {useRouter} from "next/navigation";

const GlobalSearchBox = () => {

  const [open, setOpen] = useState(false)
  const [isMac, setIsMac] = useState<boolean | undefined>(undefined)

  const router = useRouter()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  useLayoutEffect(() => {
    setIsMac(navigator.userAgent.includes('Mac'))
  }, []);

  const goTo = (path: string) => {
    console.log('goTo', path)
    setOpen(false)
    router.push(path)
  }

  return <div className="flex gap-2 w-32 transition-all cursor-pointer justify-between rounded-md border border-input bg-white px-3 p-2 text-sm ring-offset-background text-muted-foreground hover:bg-muted">
    Search
    {isMac !== undefined && <kbd
      className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
      <span className="text-xs">{
        isMac ? '⌘' : 'Ctrl'
      }</span>K
    </kbd>}
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem onSelect={() => goTo('/allocators')}>Allocators</CommandItem>
          <CommandItem>Clients</CommandItem>
          <CommandItem>Compliance Dashboard</CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  </div>
}

export {GlobalSearchBox}