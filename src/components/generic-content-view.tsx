"use client";
import {CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {PropsWithChildren, useCallback, useEffect, useState} from "react";
import {Paginator} from "@/components/ui/pagination";
import {Select, SelectContent, SelectItem, SelectTrigger} from "@/components/ui/select";
import {IApiQuery} from "@/lib/interfaces/api.interface";
import {LoaderCircle} from "lucide-react";
import {IApiListResponse} from "@/lib/interfaces/dmob.interface";

interface GenericContentHeaderProps {
  placeholder: string,
  query?: string,
  setQuery: (query: string) => void,
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
                                query, setQuery, children, placeholder, getCsv
                              }: PropsWithChildren<GenericContentHeaderProps>) => {

  const [searchQuery, setSearchQuery] = useState<string>(query ?? '');
  const [downloadCsvLoading, setDownloadCsvLoading] = useState<boolean>(false);

  useEffect(() => {
    if (searchQuery === query) return
    const timeout = setTimeout(() => {
      setQuery(searchQuery)
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
          if (value !== null) {
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

  return <CardHeader className="border-b py-3 min-h-[91px]">
    <CardTitle>
      {children}
    </CardTitle>
    <div className="flex gap-4">
      <Input className="bg-background w-64" value={searchQuery}
             placeholder={placeholder}
             onChange={(e) => setSearchQuery(e.target.value)}/>
      {getCsv && <Button variant="outline" onClick={downloadCsv}>
        {
          downloadCsvLoading ? <LoaderCircle className="animate-spin"/> : 'Download CSV'
        }
      </Button>}
    </div>
  </CardHeader>
}

interface GenericContentFooterProps {
  total: number,
  limit?: number,
  page?: number,
  patchParams: (params: Partial<IApiQuery>) => void
}

const GenericContentFooter = ({
                                total, patchParams, limit, page
                              }: GenericContentFooterProps) => {

  if (!total || !limit || !page) {
    return <></>
  }
  return <CardFooter className="border-t flex py-3 w-full justify-between">
    <Paginator page={page} perPage={limit} total={total}
               onPageChange={(page: number) => patchParams({page})}/>
    <div className="flex gap-2 font-semibold items-center text-muted-foreground">
      <p>View</p>
      <Select value={limit.toString()} onValueChange={(val) => patchParams({limit: +val, page: 1})}>
        <SelectTrigger className="bg-background">{limit}</SelectTrigger>
        <SelectContent>
          <SelectItem value="10">10</SelectItem>
          <SelectItem value="15">15</SelectItem>
          <SelectItem value="25">25</SelectItem>
        </SelectContent>
      </Select>
      <p>items per page</p>
    </div>
  </CardFooter>
}

export {GenericContentHeader, GenericContentFooter}