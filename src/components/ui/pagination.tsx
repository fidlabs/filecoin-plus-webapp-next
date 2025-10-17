"use client";

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { ButtonProps, buttonVariants } from "@/components/ui/button";
import { ComponentProps, forwardRef, useCallback, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { IApiQuery } from "@/lib/interfaces/api.interface";

export interface PaginatorProps {
  page: number;
  pageSize: number;
  pageSizeOptions?: number[];
  total: number;
  onPageChange(nextPage: number): void;
  onPageSizeChange?(nextPageSize: number): void;
}

interface InfinitePaginatorProps {
  page: number;
  perPage: number;
  currentElements: number;
  paginationSteps?: string[];
  patchParams: (params: Partial<IApiQuery>) => void;
}

const Paginator = ({
  page,
  pageSize,
  pageSizeOptions,
  total,
  onPageChange,
  onPageSizeChange,
}: PaginatorProps) => {
  const lastPage = useMemo(
    () => Math.ceil(total / pageSize),
    [pageSize, total]
  );

  const visiblePages = useMemo(() => {
    let pages = [];

    const lowerBound = Math.max(page - 1, 1);
    const upperBound = Math.min(page + 1, lastPage);

    if (lowerBound === 1) {
      pages = [1, 2, 3].filter((p) => p <= lastPage);
    } else if (upperBound === lastPage) {
      pages = [lastPage - 2, lastPage - 1, lastPage].filter((p) => p >= 1);
    } else {
      pages = [lowerBound, page, upperBound];
    }
    return pages;
  }, [lastPage, page]);

  const showPreviousEllipsis = useMemo(
    () => visiblePages[0] > 2,
    [visiblePages]
  );
  const showNextEllipsis = useMemo(
    () => visiblePages[visiblePages.length - 1] < lastPage - 1,
    [lastPage, visiblePages]
  );
  const showFirstPage = useMemo(() => visiblePages[0] > 1, [visiblePages]);
  const showEndPage = useMemo(
    () => visiblePages[visiblePages.length - 1] < lastPage,
    [lastPage, visiblePages]
  );

  const canGoBack = useMemo(() => page > 1, [page]);
  const canGoForward = useMemo(() => page < lastPage, [lastPage, page]);

  const handlePreviousPageButtonClick = useCallback(() => {
    onPageChange(page - 1);
  }, [onPageChange, page]);

  const handleNextPageButtonClick = useCallback(() => {
    onPageChange(page + 1);
  }, [onPageChange, page]);

  const handlePageSizeSelectValueChange = useCallback(
    (value: string) => {
      const numericValue = parseInt(value);

      if (isNaN(numericValue)) {
        return;
      }

      onPageSizeChange?.(numericValue);
      onPageChange(1);
    },
    [onPageChange, onPageSizeChange]
  );

  return (
    <div className="flex w-full justify-between">
      <Pagination>
        <PaginationContent>
          <PaginationItem
            className={cn(!canGoBack && "pointer-events-none")}
            onClick={handlePreviousPageButtonClick}
          >
            <PaginationPrevious />
          </PaginationItem>

          {showFirstPage && (
            <PaginatorPage
              page={1}
              isActive={page === 1}
              onPageChange={onPageChange}
            />
          )}

          {showPreviousEllipsis && (
            <PaginationEllipsis className="hidden md:flex" />
          )}

          {visiblePages.map((pageNumber) => (
            <PaginatorPage
              key={`page_${pageNumber}`}
              page={pageNumber}
              isActive={pageNumber === page}
              onPageChange={onPageChange}
            />
          ))}

          {showNextEllipsis && (
            <PaginationEllipsis className="hidden md:flex" />
          )}

          {showEndPage && (
            <PaginatorPage
              page={lastPage}
              isActive={page === lastPage}
              onPageChange={onPageChange}
            />
          )}

          <PaginationItem
            className={cn(!canGoForward && "pointer-events-none")}
            onClick={handleNextPageButtonClick}
          >
            <PaginationNext />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      {!!pageSizeOptions && (
        <div className="flex gap-2 font-semibold items-center text-muted-foreground">
          <p className="hidden md:block">View</p>
          <Select
            value={pageSize.toString()}
            onValueChange={handlePageSizeSelectValueChange}
          >
            <SelectTrigger className="bg-background">{pageSize}</SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="hidden md:block">items per page</p>
        </div>
      )}
    </div>
  );
};

interface PaginatorPageProps {
  isActive: boolean;
  page: number;
  onPageChange(nextPage: number): void;
}

function PaginatorPage({ isActive, page, onPageChange }: PaginatorPageProps) {
  const handleClick = useCallback(() => {
    onPageChange(page);
  }, [onPageChange, page]);

  return (
    <PaginationItem
      className={cn(isActive && "pointer-events-none")}
      onClick={handleClick}
    >
      <PaginationLink isActive={isActive}>{page}</PaginationLink>
    </PaginationItem>
  );
}

const InfinitePaginator = ({
  page,
  patchParams,
  perPage,
  paginationSteps,
  currentElements,
}: InfinitePaginatorProps) => {
  const startPage = 1;

  const canGoBack = useMemo(() => page > startPage, [page, startPage]);
  const canGoNext = useMemo(
    () => currentElements >= perPage,
    [currentElements, perPage]
  );

  return (
    <div className="flex w-full justify-between">
      <Pagination>
        <PaginationContent>
          <PaginationItem
            className={cn(!canGoBack && "pointer-events-none")}
            onClick={() => patchParams({ page: (page - 1).toString() })}
          >
            <PaginationPrevious />
          </PaginationItem>
          <PaginationItem className="pointer-events-none">
            <PaginationLink isActive>{page}</PaginationLink>
          </PaginationItem>
          <PaginationItem
            className={cn(!canGoNext && "pointer-events-none")}
            onClick={() =>
              patchParams({
                page: (page + 1).toString(),
              })
            }
          >
            <PaginationNext />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      <div className="flex gap-2 font-semibold items-center text-muted-foreground">
        <p className="hidden md:block">View</p>
        <Select
          value={perPage.toString()}
          onValueChange={(val) => patchParams({ limit: val, page: "1" })}
        >
          <SelectTrigger className="bg-background">{perPage}</SelectTrigger>
          <SelectContent>
            {paginationSteps?.map((step) => (
              <SelectItem key={step} value={step}>
                {step}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="hidden md:block">items per page</p>
      </div>
    </div>
  );
};

const Pagination = ({ className, ...props }: ComponentProps<"nav">) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn("flex justify-center", className)}
    {...props}
  />
);
Pagination.displayName = "Pagination";

const PaginationContent = forwardRef<HTMLUListElement, ComponentProps<"ul">>(
  ({ className, ...props }, ref) => (
    <ul
      ref={ref}
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  )
);
PaginationContent.displayName = "PaginationContent";

const PaginationItem = forwardRef<HTMLLIElement, ComponentProps<"li">>(
  ({ className, ...props }, ref) => (
    <li ref={ref} className={cn("", className)} {...props} />
  )
);
PaginationItem.displayName = "PaginationItem";

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<ButtonProps, "size"> &
  ComponentProps<"a">;

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
);
PaginationLink.displayName = "PaginationLink";

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
    <ChevronLeft className="h-4 w-4" />
  </PaginationLink>
);
PaginationPrevious.displayName = "PaginationPrevious";

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
    <ChevronRight className="h-4 w-4" />
  </PaginationLink>
);
PaginationNext.displayName = "PaginationNext";

const PaginationEllipsis = ({
  className,
  ...props
}: ComponentProps<"span">) => (
  <span
    aria-hidden
    className={cn("flex h-9 w-9 items-center justify-center", className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
);
PaginationEllipsis.displayName = "PaginationEllipsis";

export { Paginator, InfinitePaginator };
