"use client";
import Link from "next/link";
import {LogoIcon} from "@/components/icons/logo.icon";
import {TextLogoIcon} from "@/components/icons/text-logo.icon";
import {usePathname} from "next/navigation";
import {cn} from "@/lib/utils";
import {Sheet, SheetContent, SheetTrigger} from "@/components/ui/sheet";
import {MenuIcon} from "lucide-react";
import {useState} from "react";

const Header = () => {

  const [menuOpened, setMenuOpened] = useState(false)

  return <header
    className="w-full h-[110px] text-white after:absolute after:w-full after:content-[''] relative after:bg-header after:min-h-[250px] after:-z-[1] after:top-0">
    <div className="w-full h-full max-w-[1700px] mx-auto flex justify-between md:justify-start gap-6 pt-7 pb-10 px-4 md:px-12 text-white items-end">
      <Link href="/" className="flex gap-2 items-end mr-5" aria-label="Homepage logo link">
        <LogoIcon className="w-[40px] h-[40px]"/>
        <TextLogoIcon className="w-auto h-[30px]"/>
      </Link>
      <NavMenu className="hidden md:flex"/>
      {/*<GlobalSearchBox/>*/}
      <div className="md:hidden">
        <Sheet open={menuOpened} onOpenChange={setMenuOpened}>
          <SheetTrigger aria-label="Mobile nav menu trigegr">
            <MenuIcon/>
          </SheetTrigger>
          <SheetContent>
            <div>
              <NavMenu onClick={() => setMenuOpened(false)} className="md:hidden flex-col w-min !after:hidden"/>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  </header>
}

const NavMenu = ({className, onClick}: {
  className?: string,
  onClick?: () => void,
}) => {
  const path = usePathname();
  return <div className={cn('flex gap-6', className)}>
    <Link href="/" onClick={onClick} className={cn(
      "nav-link",
      {"active": path === "/"},
    )}>
      Dashboard
    </Link>
    <Link href="/allocators" onClick={onClick} className={cn(
      "nav-link",
      {"active": path.indexOf('allocators') > -1},
    )}>
      Allocators
    </Link>
    <Link href="/clients" onClick={onClick} className={cn(
      "nav-link",
      {"active": path.indexOf('clients') > -1},
    )}>
      Clients
    </Link>
    <Link href="/storage-providers" onClick={onClick} className={cn(
      "nav-link",
      {"active": path.indexOf('storage-providers') > -1},
    )}>
      Storage Providers
    </Link>
    <Link href="/compliance-data-portal" onClick={onClick} className={cn(
      "nav-link",
      {"active": path.indexOf('compliance-data-portal') > -1},
    )}>
      Compliance
    </Link>
    <Link href="/about" onClick={onClick} className={cn(
      "nav-link",
      {"active": path.indexOf('about') > -1},
    )}>
      About
    </Link>
  </div>
}

export {Header}