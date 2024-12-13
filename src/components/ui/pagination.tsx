"use client"

import {ChevronLeft, ChevronRight, MoreHorizontal} from "lucide-react"
import {cn} from "@/lib/utils"
import {ButtonProps, buttonVariants} from "@/components/ui/button"
import {ComponentProps, forwardRef, useMemo} from "react";
import {Select, SelectContent, SelectItem, SelectTrigger} from "@/components/ui/select";
import {IApiQuery} from "@/lib/interfaces/api.interface";

interface PaginatorProps {
  page: number
  perPage: number
  total: number
  paginationSteps?: string[]
  patchParams: (params: Partial<IApiQuery>) => void
}

interface InfinitePaginatorProps {
  page: number
  perPage: number
  currentElements: number,
  paginationSteps?: string[]
  patchParams: (params: Partial<IApiQuery>) => void
}

const Paginator = ({
                     page, patchParams, perPage, total, paginationSteps
                   }: PaginatorProps) => {

  const startPage = 1
  const endPage = useMemo(() => Math.ceil(total / perPage), [perPage, total])

  const visiblePages = useMemo(() => {
    let pages = [];

    const lowerBound = Math.max(page - 1, startPage);
    const upperBound = Math.min(page + 1, endPage);

    if (lowerBound === startPage) {
      pages = [startPage, startPage + 1, startPage + 2].filter(p => p <= endPage);
    } else if (upperBound === endPage) {
      pages = [endPage - 2, endPage - 1, endPage].filter(p => p >= startPage);
    } else {
      pages = [lowerBound, page, upperBound];
    }
    return pages;
  }, [endPage, page]);

  const showPreviousEllipsis = useMemo(() => visiblePages[0] > startPage + 1, [visiblePages]);
  const showNextEllipsis = useMemo(() => visiblePages[visiblePages.length - 1] < endPage - 1, [endPage, visiblePages]);
  const showFirstPage = useMemo(() => visiblePages[0] > startPage, [visiblePages]);
  const showEndPage = useMemo(() => visiblePages[visiblePages.length - 1] < endPage, [endPage, visiblePages]);

  const canGoBack = useMemo(() => page > startPage, [page, startPage]);
  const canGoForward = useMemo(() => page < endPage, [endPage, page]);

  return <div className="flex w-full justify-between">
    <Pagination>
      <PaginationContent>
        <PaginationItem className={cn(!canGoBack && 'pointer-events-none')}
                        onClick={() => patchParams({page: (page - 1).toString()})}>
          <PaginationPrevious/>
        </PaginationItem>
        {
          showFirstPage && <PaginationItem
            className="hidden md:block"
            onClick={() => patchParams({
              page: startPage.toString()
            })}>
            <PaginationLink isActive={startPage === page}>
              {startPage}
            </PaginationLink>
          </PaginationItem>
        }
        {
          showPreviousEllipsis && <PaginationEllipsis className="hidden md:flex"/>
        }
        {
          visiblePages.map((pageNumber) => (
            <PaginationItem
              className={cn(pageNumber === page && 'pointer-events-none')}
              key={pageNumber}
              onClick={() => patchParams({
                page: pageNumber.toString()
              })}>
              <PaginationLink isActive={pageNumber === page}>
                {pageNumber}
              </PaginationLink>
            </PaginationItem>
          ))
        }
        {
          showNextEllipsis && <PaginationEllipsis className="hidden md:flex"/>
        }
        {
          showEndPage && <PaginationItem
            className="hidden md:block"
            onClick={() => patchParams({
              page: endPage.toString()
            })}>
            <PaginationLink isActive={endPage === page}>
              {endPage}
            </PaginationLink>
          </PaginationItem>
        }
        <PaginationItem className={cn(!canGoForward && 'pointer-events-none')} onClick={() => patchParams({
          page: (page + 1).toString()
        })}>
          <PaginationNext/>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
    <div className="flex gap-2 font-semibold items-center text-muted-foreground">
      <p className="hidden md:block">View</p>
      <Select value={perPage.toString()} onValueChange={(val) => patchParams({limit: val, page: '1'})}>
        <SelectTrigger className="bg-background">{perPage}</SelectTrigger>
        <SelectContent>
          {paginationSteps?.map((step) => (<SelectItem key={step} value={step}>{step}</SelectItem>))}
        </SelectContent>
      </Select>
      <p className="hidden md:block">items per page</p>
    </div>
  </div>
}

const InfinitePaginator = ({
                             page, patchParams, perPage, paginationSteps,
                             currentElements
                           }: InfinitePaginatorProps) => {

  const startPage = 1

  const canGoBack = useMemo(() => page > startPage, [page, startPage]);
  const canGoNext = useMemo(() => currentElements >= perPage, [currentElements, perPage]);

  return <div className="flex w-full justify-between">
    <Pagination>
      <PaginationContent>
        <PaginationItem className={cn(!canGoBack && 'pointer-events-none')}
                        onClick={() => patchParams({page: (page - 1).toString()})}>
          <PaginationPrevious/>
        </PaginationItem>
        <PaginationItem
          className="pointer-events-none">
          <PaginationLink isActive>
            {page}
          </PaginationLink>
        </PaginationItem>
        <PaginationItem className={cn(!canGoNext && 'pointer-events-none')}
                        onClick={() => patchParams({
          page: (page + 1).toString()
        })}>
          <PaginationNext/>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
    <div className="flex gap-2 font-semibold items-center text-muted-foreground">
      <p className="hidden md:block">View</p>
      <Select value={perPage.toString()} onValueChange={(val) => patchParams({limit: val, page: '1'})}>
        <SelectTrigger className="bg-background">{perPage}</SelectTrigger>
        <SelectContent>
          {paginationSteps?.map((step) => (<SelectItem key={step} value={step}>{step}</SelectItem>))}
        </SelectContent>
      </Select>
      <p className="hidden md:block">items per page</p>
    </div>
  </div>
}

const Pagination = ({className, ...props}: ComponentProps<"nav">) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn("flex justify-center", className)}
    {...props}
  />
)
Pagination.displayName = "Pagination"

const PaginationContent = forwardRef<
  HTMLUListElement,
  ComponentProps<"ul">
>(({className, ...props}, ref) => (
  <ul
    ref={ref}
    className={cn("flex flex-row items-center gap-1", className)}
    {...props}
  />
))
PaginationContent.displayName = "PaginationContent"

const PaginationItem = forwardRef<
  HTMLLIElement,
  ComponentProps<"li">
>(({className, ...props}, ref) => (
  <li ref={ref} className={cn("", className)} {...props} />
))
PaginationItem.displayName = "PaginationItem"

type PaginationLinkProps = {
  isActive?: boolean
} & Pick<ButtonProps, "size"> &
  ComponentProps<"a">

const PaginationLink = ({
                          className,
                          isActive,
                          size = "icon",
                          ...props
                        }: PaginationLinkProps) => (
  <a
    aria-current={isActive ? "page" : undefined}
    className={cn(
      buttonVariants({
        variant: isActive ? "outline" : "ghost",
        size,
      }),
      "cursor-pointer",
      className
    )}
    {...props}
  />
)
PaginationLink.displayName = "PaginationLink"

const PaginationPrevious = ({
                              className,
                              ...props
                            }: ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to previous page"
    size="default"
    className={cn("gap-1 pl-2.5", className)}
    {...props}
  >
    <ChevronLeft className="h-4 w-4"/>
  </PaginationLink>
)
PaginationPrevious.displayName = "PaginationPrevious"

const PaginationNext = ({
                          className,
                          ...props
                        }: ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to next page"
    size="default"
    className={cn("gap-1 pr-2.5", className)}
    {...props}
  >
    <ChevronRight className="h-4 w-4"/>
  </PaginationLink>
)
PaginationNext.displayName = "PaginationNext"

const PaginationEllipsis = ({
                              className,
                              ...props
                            }: ComponentProps<"span">) => (
  <span
    aria-hidden
    className={cn("flex h-9 w-9 items-center justify-center", className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4"/>
    <span className="sr-only">More pages</span>
  </span>
)
PaginationEllipsis.displayName = "PaginationEllipsis"

export {
  Paginator,
  InfinitePaginator,
}
