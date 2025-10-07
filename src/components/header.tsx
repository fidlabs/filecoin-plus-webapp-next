"use client";

import Link from "next/link";
import { LogoIcon } from "@/components/icons/logo.icon";
import { TextLogoIcon } from "@/components/icons/text-logo.icon";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ChevronRight, MenuIcon } from "lucide-react";
import { Fragment, useState } from "react";
import { GlobalSearchBox } from "@/components/global-search/global-search-box";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { Container } from "./container";

interface NavigationItem {
  label: string;
  path: string;
  strictPath?: boolean;
  external?: boolean;
}

interface NavigationGroup {
  label: string;
  items: NavigationItem[];
}

const navigation: Array<NavigationItem | NavigationGroup> = [
  {
    label: "Dashboard",
    path: "/",
    strictPath: true,
  },
  {
    label: "Allocators",
    items: [
      {
        label: "Allocators List",
        path: "/allocators",
      },
      {
        label: "Metaaallocators List",
        path: "/metaallocators",
      },
    ],
  },
  {
    label: "Clients",
    path: "/clients",
  },
  {
    label: "Storage Providers",
    path: "/storage-providers",
  },
  {
    label: "Compliance",
    path: "/compliance-data-portal",
  },
  {
    label: "Alerts",
    path: "/alerts",
  },
  {
    label: "About",
    path: "/about",
  },
  {
    label: "Ecosystem",
    items: [
      {
        label: "Filecoin",
        path: "https://filecoin.io",
        external: true,
      },
      {
        label: "Fil+",
        path: "https://fil.org",
        external: true,
      },
      {
        label: "Documentation",
        path: "https://docs.filecoin.io",
        external: true,
      },
    ],
  },
];

function isNavigationItemActive(
  navigationItem: NavigationItem,
  path: string
): boolean {
  return navigationItem.strictPath
    ? navigationItem.path === path
    : path.startsWith(navigationItem.path);
}

function isNavgiationGroup(
  input: NavigationItem | NavigationGroup
): input is NavigationGroup {
  return Array.isArray((input as unknown as Record<string, unknown>).items);
}

const Header = () => {
  const [menuOpened, setMenuOpened] = useState(false);

  return (
    <header className="w-full h-[110px] bg-header text-white">
      <Container className="w-full h-full flex justify-between md:justify-start gap-6 pt-7 pb-10 text-white items-end">
        <Link
          href="/"
          className="flex gap-2 items-end mr-5"
          aria-label="Homepage logo link"
        >
          <LogoIcon className="w-[40px] h-[40px]" />
          <TextLogoIcon className="w-auto h-[30px]" />
        </Link>
        <NavMenu className="hidden md:flex" />
        <GlobalSearchBox />
        <div className="md:hidden">
          <Sheet open={menuOpened} onOpenChange={setMenuOpened}>
            <SheetTrigger aria-label="Mobile nav menu trigegr">
              <MenuIcon />
            </SheetTrigger>
            <SheetContent>
              <div>
                <NavMenu
                  onClick={() => setMenuOpened(false)}
                  className="md:hidden flex-col w-min !after:hidden"
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </Container>
    </header>
  );
};

const NavMenu = ({
  className,
  onClick,
}: {
  className?: string;
  onClick?: () => void;
}) => {
  const path = usePathname();

  return (
    <div className={cn("flex gap-6", className)}>
      {navigation.map((item, index) => {
        const group = isNavgiationGroup(item);
        const key = group
          ? `nav_group_${index}_${item.label}`
          : `nav_item_${index}_${item.path}`;

        if (group) {
          const groupActive = item.items.some((item) =>
            isNavigationItemActive(item, path)
          );

          return (
            <Fragment key={key}>
              <div className="hidden md:flex">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className={cn("nav-link flex items-center gap-1", {
                      active: groupActive,
                    })}
                  >
                    {item.label}
                    <ChevronDown className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {item.items.map((innerItem, index) => (
                      <DropdownMenuItem key={`${key}_item_${index}`} asChild>
                        <Link
                          href={innerItem.path}
                          target={innerItem.external ? "_blank" : undefined}
                          onClick={onClick}
                        >
                          {innerItem.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="md:hidden">
                <h3 className="text-base font-semibold">{item.label}</h3>
                <div className="flex flex-col mt-6 gap-2">
                  {item.items.map((innerItem, index) => (
                    <Link
                      key={`${key}_item_${index}`}
                      href={innerItem.path}
                      className={cn("nav-link", {
                        active: isNavigationItemActive(innerItem, path),
                      })}
                      target={innerItem.external ? "_blank" : undefined}
                      onClick={onClick}
                    >
                      <div className="flex items-center gap-2">
                        <ChevronRight />
                        {innerItem.label}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </Fragment>
          );
        }

        return (
          <Link
            key={key}
            href={item.path}
            onClick={onClick}
            className={cn("nav-link", {
              active: isNavigationItemActive(item, path),
            })}
            target={item.external ? "_blank" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
};

export { Header };
