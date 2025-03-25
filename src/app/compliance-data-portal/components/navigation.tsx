"use client";

import { useMemo, useState } from "react";
import { useMediaQuery } from "usehooks-ts";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  {
    group: "SPs",
    links: [
      {
        id: "ComplianceSP",
        link: "/compliance-data-portal/storage-providers/compliance",
        label: "Compliance",
      },
      {
        id: "RetrievabilityScoreSP",
        link: "/compliance-data-portal/storage-providers/retrievability",
        label: "Retrievability Score",
      },
      {
        id: "NumberOfDealsSP",
        link: "/compliance-data-portal/storage-providers/number-of-deals",
        label: "Number of Allocations",
      },
      {
        id: "BiggestDealsSP",
        link: "/compliance-data-portal/storage-providers/biggest-deals",
        label: "Biggest Allocation",
      },
      {
        id: "IpniMisreporting",
        link: "/compliance-data-portal/storage-providers/ipni-misreporting",
        label: "IPNI Misreporting",
      },
      {
        id: "ClientDiversitySP",
        link: "/compliance-data-portal/storage-providers/client-diversity",
        label: "Client Diversity",
      },
    ],
  },
  {
    group: "Allocators",
    links: [
      {
        id: "RetrievabilityScoreAllocator",
        link: "/compliance-data-portal/allocators/retrievability",
        label: "Retrievability Score",
      },
      {
        id: "BiggestDealsAllocator",
        link: "/compliance-data-portal/allocators/biggest-deals",
        label: "Biggest Allocation",
      },
      {
        id: "ProviderComplianceAllocator",
        link: "/compliance-data-portal/allocators/providers-compliance",
        label: "SP Compliance",
      },
      {
        id: "AuditStateAllocator",
        link: "/compliance-data-portal/allocators/audit-state",
        label: "Audit State",
      },
      {
        id: "AuditOutcomesAllocator",
        link: "/compliance-data-portal/allocators/audit-outcomes",
        label: "Audit Outcomes",
      },
      {
        id: "AuditTimelineAllocator",
        link: "/compliance-data-portal/allocators/audit-timeline",
        label: "Audit Times",
      },
      {
        id: "ClientDiversityAllocator",
        link: "/compliance-data-portal/allocators/client-diversity",
        label: "Client Diversity",
      },
    ],
  },
  {
    group: "Old Datacap",
    links: [
      {
        id: "OldDatacapOwnedByEntities",
        link: "/compliance-data-portal/old-datacap/owned-by-entities",
        label: "Owned by Entities",
      },
      {
        id: "OldDatacapAllocatedToClients",
        link: "/compliance-data-portal/old-datacap/allocated-to-clients",
        label: "Allocated to Clients",
      },
      {
        id: "OldDatacapOwnedByClients",
        link: "/compliance-data-portal/old-datacap/owned-by-clients",
        label: "Owned by Clients",
      },
      {
        id: "OldDatacapSpentByClients",
        link: "/compliance-data-portal/old-datacap/spent-by-clients",
        label: "Spent by Clients",
      },
    ],
  },
];

const NavComponent = () => {
  const [drawerOpened, setDrawerOpened] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)", {
    initializeWithValue: true,
  });

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
  const pathname = usePathname();

  const getOffset = (path: string) => {
    const groupOrder = nav.findIndex((group) =>
      group.links.some((link) => link.link === path)
    );
    const itemFlatIndex = nav
      .flatMap((group) => group.links)
      .findIndex((link) => link.link === path);

    return 16 + groupOrder * 24 + itemFlatIndex * 30;
  };

  const top = useMemo(() => {
    return getOffset(pathname);
  }, [pathname]);

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
              <Link
                key={link.id}
                className="bg-transparent border-none outline-none text-left text-base leading-5 font-semibold text-theme-text h-[22px]"
                href={link.link}
              >
                {link.label}
              </Link>
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
