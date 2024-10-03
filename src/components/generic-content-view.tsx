"use client";
import {CardFooter, CardHeader} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Button, buttonVariants} from "@/components/ui/button";
import {ReactNode, useCallback, useEffect, useState} from "react";
import {Paginator} from "@/components/ui/pagination";
import {IApiQuery} from "@/lib/interfaces/api.interface";
import {ChevronRight, DownloadIcon, LoaderCircle, MenuIcon} from "lucide-react";
import {cn} from "@/lib/utils";
import {Drawer, DrawerContent, DrawerTrigger} from "@/components/ui/drawer";
import {ITabNavigatorTab, TabNavigator} from "@/components/ui/tab-navigator";
import Link from "next/link";
import {Separator} from "@/components/ui/separator";

interface GenericContentHeaderProps {
  placeholder: string,
  fixedHeight?: boolean,
  sticky?: boolean,
  addons?: ReactNode,
  header?: ReactNode,
  navigation?: ITabNavigatorTab[],
  selected?: string
  query?: string,
  setQuery?: (query: string) => void,
  getCsv?: {
    method: () => Promise<{
      data: never[]
    }>,
    title: string,
    headers: {
      key: string,
      label: string
    }[]
  }
}

const GenericContentHeader = ({
                                header,
                                navigation,
                                selected,
                                addons,
                                query,
                                setQuery,
                                placeholder,
                                getCsv,
                                sticky,
                                fixedHeight = true
                              }: GenericContentHeaderProps) => {

  const [searchQuery, setSearchQuery] = useState<string>(query ?? '');
  const [downloadCsvLoading, setDownloadCsvLoading] = useState<boolean>(false);

  useEffect(() => {
    if (searchQuery === query) return
    const timeout = setTimeout(() => {
      setQuery && setQuery(searchQuery)
    }, 350)

    return () => clearTimeout(timeout)
  }, [query, searchQuery, setQuery])

  const downloadCsv = useCallback(async () => {
    if (getCsv) {
      setDownloadCsvLoading(true)
      const {method, title, headers} = getCsv
      const headerString = headers.map((column) => column.label).join(',')
      const allowedKeys = headers.map((column) => column.key)

      const data = await method()

      const dataString = data?.data.map((entry: never) => {
        return allowedKeys.map((key) => {
          const value = entry[key]
          if (!!value) {
            return JSON.stringify(value).replace(/,/g, ' ').replace(/;/g, ' ')
          }
          return ''
        }).join(',')
      }).join('\r\n')

      const resultString = `${headerString}\r\n${dataString}`;

      const blob = new Blob([resultString], {
        type: 'text/csv;charset=utf-8;'
      });

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = title
      a.click()
      URL.revokeObjectURL(url)
      setDownloadCsvLoading(false)
    }
  }, [getCsv])

  return <CardHeader
    className={cn("border-b items-center block sm:flex flex-wrap gap-3 p-3",
      fixedHeight && 'min-h-[91px]',
      sticky && 'sticky top-0 bg-white z-10 rounded-t-lg',
      !setQuery && 'flex w-full justify-between'
    )}>
    <div className="flex w-full lg:w-auto justify-between items-center">
      {header && header}
      {navigation && selected && <TabNavigator tabs={navigation} selected={selected}/>}
      <div className="lg:hidden">
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="ghost" size="icon">
              <MenuIcon/>
            </Button>
          </DrawerTrigger>
          <DrawerContent className="flex flex-col p-4 pb-10 items-stretch gap-4">
            <div className="flex flex-col gap-4 md:hidden">
              {
                navigation?.filter(({value}) => value !== selected).map(({label, href}, index) =>
                  <Link
                    key={index}
                    href={href}
                    className={cn(buttonVariants({variant: 'outline'}), 'flex gap-2 items-center')}
                  >
                    {label}
                    <ChevronRight/>
                  </Link>
                )
              }
              {navigation && <Separator/>}
            </div>
            {addons}
            {getCsv && <Button variant="outline" onClick={downloadCsv}>
              {
                downloadCsvLoading ? <LoaderCircle className="animate-spin"/> :
                  <p className="flex items-center gap-2">{'Export to CSV'} <DownloadIcon size={15}/></p>
              }
            </Button>}
          </DrawerContent>
        </Drawer>
      </div>
    </div>
    <div className={cn("flex flex-row justify-end gap-3 sm:mt-0", !!setQuery && ' mt-3 sm:mt-0')}>
      {!!setQuery && <Input className="bg-background w-full max-w-[350px] sm:w-64 text-[18px] lg:text-base" value={searchQuery}
                            placeholder={placeholder}
                            onChange={(e) => setSearchQuery(e.target.value)}/>}
      <div className="hidden lg:block">
        {addons}
      </div>
      {getCsv && <Button variant="outline" className="hidden lg:block" onClick={downloadCsv}>
          {
            downloadCsvLoading ? <LoaderCircle className="animate-spin"/> : 'Export to CSV'
          }
        </Button>}
    </div>
  </CardHeader>
}

interface GenericContentFooterProps {
  total: string,
  limit?: string,
  page?: string,
  paginationSteps?: string[]
  patchParams: (params: Partial<IApiQuery>) => void
}

const GenericContentFooter = ({
                                total, patchParams, limit, page,
                                paginationSteps = ['10', '15', '25']
                              }: GenericContentFooterProps) => {

  if (!total || !limit || !page) {
    return <></>
  }
  return <CardFooter className="border-t w-full p-3">
    <Paginator page={+page} perPage={+limit} total={+total}
               paginationSteps={paginationSteps}
               patchParams={patchParams}/>
  </CardFooter>
}

export {GenericContentHeader, GenericContentFooter}