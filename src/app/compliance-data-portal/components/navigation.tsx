"use client";

import { useEffect, useMemo, useState } from "react";
import { useCDPUtils } from "@/lib/providers/cdp.provider";
import { useMediaQuery } from "usehooks-ts";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import dynamic from "next/dynamic";

const nav = [
  {
    group: "SPs",
    links: [
      {
        id: "ComplianceSP",
        label: "Compliance",
      },
      {
        id: "RetrievabilityScoreSP",
        label: "Retrievability Score",
      },
      {
        id: "NumberOfDealsSP",
        label: "Number of allocations",
      },
      {
        id: "BiggestDealsSP",
        label: "Biggest allocation",
      },
      {
        id: "IpniMisreporting",
        label: "IPNI misreporting",
      },
    ],
  },
  {
    group: "Allocators",
    links: [
      {
        id: "RetrievabilityScoreAllocator",
        label: "Retrievability Score",
      },
      {
        id: "BiggestDealsAllocator",
        label: "Biggest allocation",
      },
      {
        id: "ProviderComplianceAllocator",
        label: "SP Compliance",
      },
      {
        id: "AuditStateAllocator",
        label: "Audit state",
      },
      {
        id: "AuditOutcomesAllocator",
        label: "Audit Outcomes",
      },
      {
        id: "AuditTimelineAllocator",
        label: "Audit Times",
      },
    ],
  },
];

const NavComponent = () => {
  const { currentElement } = useCDPUtils();

  const [drawerOpened, setDrawerOpened] = useState(false);

  const isDesktop = useMediaQuery("(min-width: 768px)", {
    initializeWithValue: true,
  });

  useEffect(() => {
    setDrawerOpened(false);
  }, [currentElement]);

  if (!isDesktop) {
    return (
      <Drawer open={drawerOpened} onOpenChange={setDrawerOpened}>
        <DrawerTrigger asChild>
          <Button
            variant="default"
            className="fixed bottom-0 left-0 w-full z-50 min-h-12"
          >
            Select chart
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <div className="p-6">
            <Menu />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <div className="hidden md:block">
      <div className="sticky top-[50px]">
        <Menu />
      </div>
    </div>
  );
};

const Menu = () => {
  const { currentElement, scrollTo } = useCDPUtils();

  const getOffset = (id: string) => {
    const groupOrder = nav.findIndex((group) =>
      group.links.some((link) => link.id === id)
    );
    const itemFlatIndex = nav
      .flatMap((group) => group.links)
      .findIndex((link) => link.id === id);

    return 16 + groupOrder * 24 + itemFlatIndex * 30;
  };

  const top = useMemo(() => {
    return getOffset(currentElement);
  }, [currentElement]);

  return (
    <div className="min-w-[250px] relative flex flex-col text-xs leading-4 font-medium text-theme-text-secondary gap-4">
      <div
        className="absolute w-1 h-[22px] bg-dodger-blue rounded top-0 -left-1 transition-[top] duration-300 ease-in-out"
        style={{ top }}
      />
      {nav.map((group) => (
        <div key={group.group}>
          <div>{group.group}</div>
          <div className="flex flex-col ml-4 gap-2">
            {group.links.map((link) => (
              <button
                key={link.id}
                className="bg-transparent border-none outline-none text-left text-base leading-5 font-semibold text-theme-text h-[22px]"
                onClick={() => scrollTo(link.id)}
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const Navigation = dynamic(() => Promise.resolve(NavComponent), {
  ssr: false,
});

export { Navigation };
