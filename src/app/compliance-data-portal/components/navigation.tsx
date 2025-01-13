"use client";

import {useEffect, useMemo, useState} from "react";
import {useCDPUtils} from "@/lib/providers/cdp.provider";
import {useMediaQuery} from "usehooks-ts";
import {Button} from "@/components/ui/button";
import {Drawer, DrawerContent, DrawerTrigger} from "@/components/ui/drawer";
import dynamic from "next/dynamic";

const NavComponent = () => {

  const {currentElement} = useCDPUtils();

  const [drawerOpened, setDrawerOpened] = useState(false)

  const isDesktop = useMediaQuery("(min-width: 768px)", {
    initializeWithValue: true,
  })

  useEffect(() => {
    setDrawerOpened(false)
  }, [currentElement])

  if (!isDesktop) {
    return <Drawer open={drawerOpened} onOpenChange={setDrawerOpened}>
      <DrawerTrigger asChild>
        <Button variant="default" className="fixed bottom-0 left-0 w-full z-50 min-h-12">
          Select chart
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="p-6">
          <Menu/>
        </div>
      </DrawerContent>
    </Drawer>
  }

  return <div className="hidden md:block">
    <div className="sticky top-[50px]">
      <Menu/>
    </div>
  </div>
}

const Menu = () => {

  const {currentElement, scrollTo} = useCDPUtils();

  const top = useMemo(() => {
    switch (currentElement) {
      case 'RetrievabilityScoreSP':
        return 16;
      case 'NumberOfDealsSP':
        return 16 + 22 + 8;
      case 'BiggestDealsSP':
        return 16 + 22 + 22 + 16;
      case 'RetrievabilityScoreAllocator':
        return 16 + 22 + 22 + 22 + 48;
      case 'BiggestDealsAllocator':
        return 16 + 22 + 22 + 22 + 22 + 56;
      case 'ProviderComplianceAllocator':
        return 16 + 22 + 22 + 22 + 22 + 22 + 64;
      case 'AuditStateAllocator':
        return 16 + 22 + 22 + 22 + 22 + 22 + 22 + 72;
      case 'TrustLevelAllocator':
        return 16 + 22 + 22 + 22 + 22 + 22 + 22 + 22 + 80;
    }
  }, [currentElement]);

  return <div
    className="min-w-[250px] relative flex flex-col text-xs leading-4 font-medium text-theme-text-secondary gap-4">
    <div
      className="absolute w-1 h-[22px] bg-dodger-blue rounded top-0 -left-1 transition-[top] duration-300 ease-in-out"
      style={{top}}/>
    <div>
      <div>SPs</div>
      <div className="flex flex-col ml-4 gap-2">
        <button
          className="bg-transparent border-none outline-none text-left text-base leading-5 font-semibold text-theme-text h-[22px]"
          onClick={() => scrollTo('RetrievabilityScoreSP')}>Retrievability Score
        </button>
        <button
          className="bg-transparent border-none outline-none text-left text-base leading-5 font-semibold text-theme-text h-[22px]"
          onClick={() => scrollTo('NumberOfDealsSP')}>Number of allocations
        </button>
        <button
          className="bg-transparent border-none outline-none text-left text-base leading-5 font-semibold text-theme-text h-[22px]"
          onClick={() => scrollTo('BiggestDealsSP')}>Biggest allocation
        </button>
      </div>
    </div>
    <div>
      <div>Allocators</div>
      <div className="flex flex-col ml-4 gap-2">
        <button
          className="bg-transparent border-none outline-none text-left text-base leading-5 font-semibold text-theme-text h-[22px]"
          onClick={() => scrollTo('RetrievabilityScoreAllocator')}>Retrievability Score
        </button>
        <button
          className="bg-transparent border-none outline-none text-left text-base leading-5 font-semibold text-theme-text h-[22px]"
          onClick={() => scrollTo('BiggestDealsAllocator')}>Biggest allocation
        </button>
        <button
          className="bg-transparent border-none outline-none text-left text-base leading-5 font-semibold text-theme-text h-[22px]"
          onClick={() => scrollTo('ProviderComplianceAllocator')}>SP Compliance
        </button>
        <button
          className="bg-transparent border-none outline-none text-left text-base leading-5 font-semibold text-theme-text h-[22px]"
          onClick={() => scrollTo('AuditStateAllocator')}>Audit state
        </button>
        <button
          className="bg-transparent border-none outline-none text-left text-base leading-5 font-semibold text-theme-text h-[22px]"
          onClick={() => scrollTo('TrustLevelAllocator')}>Trust level
        </button>
      </div>
    </div>
  </div>
}

const Navigation = dynamic(() => Promise.resolve(NavComponent), {
  ssr: false
});

export {Navigation};