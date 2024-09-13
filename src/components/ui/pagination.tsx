"use client"

import * as React from "react"
import {ChevronLeft, ChevronRight, MoreHorizontal} from "lucide-react"
import {cn} from "@/lib/utils"
import {ButtonProps, buttonVariants} from "@/components/ui/button"
import {useMemo} from "react";

interface PaginatorProps {
  page: number
  perPage: number
  total: number
  onPageChange: (page: number) => void
}

const Paginator = ({
                     page, onPageChange, perPage, total
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


  return <Pagination>
    <PaginationContent>
      <PaginationItem onClick={() => onPageChange(page - 1)}>
        <PaginationPrevious/>
      </PaginationItem>
      {
        showFirstPage && <PaginationItem onClick={() => onPageChange(startPage)}>
          <PaginationLink isActive={startPage === page}>
            {startPage}
          </PaginationLink>
        </PaginationItem>
      }
      {
        showPreviousEllipsis && <PaginationEllipsis/>
      }
      {
        visiblePages.map((pageNumber) => (
          <PaginationItem key={pageNumber} onClick={() => onPageChange(pageNumber)}>
            <PaginationLink isActive={pageNumber === page}>
              {pageNumber}
            </PaginationLink>
          </PaginationItem>
        ))
      }
      {
        showNextEllipsis && <PaginationEllipsis/>
      }
      {
        showEndPage && <PaginationItem onClick={() => onPageChange(endPage)}>
          <PaginationLink isActive={endPage === page}>
            {endPage}
          </PaginationLink>
        </PaginationItem>
      }
      <PaginationItem onClick={() => onPageChange(page + 1)}>
        <PaginationNext/>
      </PaginationItem>
    </PaginationContent>
  </Pagination>
}

const Pagination = ({className, ...props}: React.ComponentProps<"nav">) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn("flex justify-center", className)}
    {...props}
  />
)
Pagination.displayName = "Pagination"

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({className, ...props}, ref) => (
  <ul
    ref={ref}
    className={cn("flex flex-row items-center gap-1", className)}
    {...props}
  />
))
PaginationContent.displayName = "PaginationContent"

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({className, ...props}, ref) => (
  <li ref={ref} className={cn("", className)} {...props} />
))
PaginationItem.displayName = "PaginationItem"

type PaginationLinkProps = {
  isActive?: boolean
} & Pick<ButtonProps, "size"> &
  React.ComponentProps<"a">

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
                            }: React.ComponentProps<typeof PaginationLink>) => (
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
                        }: React.ComponentProps<typeof PaginationLink>) => (
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
                            }: React.ComponentProps<"span">) => (
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
}
