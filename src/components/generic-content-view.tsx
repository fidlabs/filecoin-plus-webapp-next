"use client";
import { CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { ReactNode, RefObject, useCallback, useEffect, useState } from "react";
import { Paginator, InfinitePaginator } from "@/components/ui/pagination";
import { IApiQuery } from "@/lib/interfaces/api.interface";
import {
  ChevronRight,
  DownloadIcon,
  LoaderCircle,
  MenuIcon,
  XIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { ITabNavigatorTab, TabNavigator } from "@/components/ui/tab-navigator";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { useScrollObserver } from "@/lib/hooks/useScrollObserver";

interface GenericContentHeaderProps {
  placeholder?: string;
  fixedHeight?: boolean;
  sticky?: boolean;
  titleAddons?: ReactNode;
  addons?: ReactNode;
  header?: ReactNode;
  navigation?: ITabNavigatorTab[];
  selected?: string;
  query?: string;
  setQuery?: (query: string) => void;
  getCsv?: {
    method: () => Promise<{
      data: never[];
    }>;
    title: string;
    headers: {
      key: string;
      label: string;
    }[];
  };
}

const GenericContentHeader = ({
  header,
  navigation,
  selected,
  titleAddons,
  addons,
  sticky,
  query,
  setQuery,
  placeholder,
  getCsv,
  fixedHeight = true,
}: GenericContentHeaderProps) => {
  const [searchQuery, setSearchQuery] = useState<string>(query ?? "");
  const [downloadCsvLoading, setDownloadCsvLoading] = useState<boolean>(false);

  useEffect(() => {
    if (searchQuery === query) return;
    const timeout = setTimeout(() => {
      setQuery && setQuery(searchQuery);
    }, 350);

    return () => clearTimeout(timeout);
  }, [query, searchQuery, setQuery]);

  const { top, ref } = useScrollObserver();

  const downloadCsv = useCallback(async () => {
    if (getCsv) {
      setDownloadCsvLoading(true);
      const { method, title, headers } = getCsv;
      const headerString = headers.map((column) => column.label).join(",");
      const allowedKeys = headers.map((column) => column.key);

      const data = await method();

      const dataString = data?.data
        .map((entry: never) => {
          return allowedKeys
            .map((key) => {
              const value = entry[key];
              if (!!value) {
                return JSON.stringify(value)
                  .replace(/,/g, " ")
                  .replace(/;/g, " ");
              }
              return "";
            })
            .join(",");
        })
        .join("\r\n");

      const resultString = `${headerString}\r\n${dataString}`;

      const blob = new Blob([resultString], {
        type: "text/csv;charset=utf-8;",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = title;
      a.click();
      URL.revokeObjectURL(url);
      setDownloadCsvLoading(false);
    }
  }, [getCsv]);

  return (
    <CardHeader
      ref={ref as RefObject<HTMLDivElement>}
      className={cn(
        "border-b items-center block sm:flex flex-wrap gap-3 p-3 rounded-t-lg",
        fixedHeight && "min-h-[91px]",
        !setQuery && "flex w-full justify-between",
        sticky && "sticky top-[-1px] z-10 bg-white",
        sticky && top === -1 && "rounded-t-none"
      )}
    >
      <div className="flex w-full lg:w-auto justify-between items-center">
        {header && header}
        {navigation && selected && (
          <TabNavigator tabs={navigation} selected={selected} />
        )}
        {titleAddons && (
          <div className="ml-2 flex gap-2 justify-center items-center">
            {titleAddons}
          </div>
        )}
        <div className="lg:hidden">
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="ghost" size="icon">
                <MenuIcon />
              </Button>
            </DrawerTrigger>
            <DrawerContent className="flex flex-col p-4 pb-10 items-stretch gap-4">
              <div className="flex flex-col gap-4 md:hidden">
                {navigation
                  ?.filter(({ value }) => value !== selected)
                  .map(({ label, href }, index) => (
                    <Link
                      key={index}
                      href={href}
                      prefetch={true}
                      className={cn(
                        buttonVariants({ variant: "outline" }),
                        "flex gap-2 items-center"
                      )}
                    >
                      {label}
                      <ChevronRight />
                    </Link>
                  ))}
                {navigation && <Separator />}
              </div>
              {addons}
              {getCsv && (
                <Button variant="outline" onClick={downloadCsv}>
                  {downloadCsvLoading ? (
                    <LoaderCircle className="animate-spin" />
                  ) : (
                    <p className="flex items-center gap-2">
                      {"Export to CSV"} <DownloadIcon size={15} />
                    </p>
                  )}
                </Button>
              )}
            </DrawerContent>
          </Drawer>
        </div>
      </div>
      <div
        className={cn(
          "flex flex-row justify-end gap-2 sm:mt-0",
          !!setQuery && " mt-3 sm:mt-0"
        )}
      >
        {!!setQuery && placeholder && (
          <div className="relative w-full md:max-w-[350px] ">
            <Input
              className="bg-background w-full text-[18px] lg:text-base"
              value={searchQuery}
              placeholder={placeholder}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {!!searchQuery.length && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-0 right-0"
                onClick={() => setSearchQuery("")}
              >
                <XIcon />
              </Button>
            )}
          </div>
        )}
        {addons && (
          <div className="hidden lg:flex gap-2 items-center justify-center">
            {addons}
          </div>
        )}
        {getCsv && (
          <Button
            variant="outline"
            className="hidden lg:block"
            onClick={downloadCsv}
          >
            {downloadCsvLoading ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              "Export to CSV"
            )}
          </Button>
        )}
      </div>
    </CardHeader>
  );
};

interface GenericContentFooterProps {
  total?: string;
  currentElements?: number;
  limit?: string;
  page?: string;
  pageSizeOptions?: number[];
  patchParams: (params: Partial<IApiQuery>) => void;
}

const GenericContentFooter = ({
  total,
  patchParams,
  limit,
  page,
  currentElements,
  pageSizeOptions = [10, 15, 25],
}: GenericContentFooterProps) => {
  if (!limit || !page) {
    return <></>;
  }

  const handlePageChange = useCallback(
    (page: number) => {
      patchParams({
        page: page.toString(),
      });
    },
    [patchParams]
  );

  const handlePageSizeChange = useCallback(
    (pageSize: number) => {
      patchParams({
        limit: pageSize.toString(),
        page: "1",
      });
    },
    [patchParams]
  );

  return (
    <CardFooter className="border-t w-full p-3">
      {total && (
        <Paginator
          page={+page}
          pageSize={+limit}
          total={+total}
          pageSizeOptions={pageSizeOptions}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
      {!total && (
        <InfinitePaginator
          page={+page}
          perPage={+limit}
          currentElements={currentElements ?? 0}
          paginationSteps={pageSizeOptions.map(String)}
          patchParams={patchParams}
        />
      )}
    </CardFooter>
  );
};

export { GenericContentHeader, GenericContentFooter };
