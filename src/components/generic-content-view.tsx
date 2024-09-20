"use client";
import {CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {PropsWithChildren, useCallback, useEffect, useState} from "react";
import {Paginator} from "@/components/ui/pagination";
import {Select, SelectContent, SelectItem, SelectTrigger} from "@/components/ui/select";
import {IApiQuery} from "@/lib/interfaces/api.interface";
import {LoaderCircle, MenuIcon} from "lucide-react";
import {cn} from "@/lib/utils";
import {DropdownMenu, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";

interface GenericContentHeaderProps {
  placeholder: string,
  fixedHeight?: boolean,
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
                                query, setQuery, children, placeholder, getCsv, fixedHeight = true
                              }: PropsWithChildren<GenericContentHeaderProps>) => {

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
    className={cn("border-b items-center block sm:flex flex-wrap gap-3 p-3", fixedHeight && 'min-h-[91px]')}>
    <CardTitle>
      {children}
    </CardTitle>
    <div className="flex flex-row justify-end gap-3 mt-3 sm:mt-0">
      {!!setQuery && <Input className="bg-background w-full max-w-96 sm:w-64" value={searchQuery}
                            placeholder={placeholder}
                            onChange={(e) => setSearchQuery(e.target.value)}/>}
      {getCsv && <>
        <Button variant="outline" className="hidden md:block" onClick={downloadCsv}>
          {
            downloadCsvLoading ? <LoaderCircle className="animate-spin"/> : 'Export to CSV'
          }
        </Button>
        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost">
                <MenuIcon className="h-5 w-5"/>
              </Button>
            </DropdownMenuTrigger>
          </DropdownMenu>
        </div>
      </>}
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
  return <CardFooter className="border-t flex py-3 w-full justify-between">
    <Paginator page={+page} perPage={+limit} total={+total}
               onPageChange={(page: number) => patchParams({page: page.toString()})}/>
    <div className="flex gap-2 font-semibold items-center text-muted-foreground">
      <p>View</p>
      <Select value={limit.toString()} onValueChange={(val) => patchParams({limit: val, page: '1'})}>
        <SelectTrigger className="bg-background">{limit}</SelectTrigger>
        <SelectContent>
          {paginationSteps?.map((step) => (<SelectItem key={step} value={step}>{step}</SelectItem>))}
        </SelectContent>
      </Select>
      <p>items per page</p>
    </div>
  </CardFooter>
}

export {GenericContentHeader, GenericContentFooter}