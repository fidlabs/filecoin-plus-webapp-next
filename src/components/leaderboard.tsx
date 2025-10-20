import { cn } from "@/lib/utils";
import {
  type OlHTMLAttributes,
  type HTMLAttributes,
  type LiHTMLAttributes,
  useCallback,
} from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";

export type LeaderboardProps = HTMLAttributes<HTMLDivElement>;
export function Leaderboard({
  children,
  className,
  ...rest
}: LeaderboardProps) {
  return (
    <div
      {...rest}
      className={cn("bg-white rounded-md shadow-f-card", className)}
    >
      {children}
    </div>
  );
}

export type LeaderboardHeaderProps = HTMLAttributes<HTMLDivElement>;
export function LeaderboardHeader({
  children,
  className,
  ...rest
}: LeaderboardHeaderProps) {
  return (
    <div {...rest} className={cn("p-3", className)}>
      {children}
    </div>
  );
}

export type LeaderboardTitleProps = HTMLAttributes<HTMLHeadingElement>;
export function LeaderboardTitle({
  children,
  className,
  ...rest
}: LeaderboardTitleProps) {
  return (
    <h5 {...rest} className={cn("text-md font-medium", className)}>
      {children}
    </h5>
  );
}

export type LeaderboardListProps = OlHTMLAttributes<HTMLOListElement>;
export function LeaderboardList({ children, ...rest }: LeaderboardListProps) {
  return <ol {...rest}>{children}</ol>;
}

export type LeaderboardItemProps = LiHTMLAttributes<HTMLLIElement> & {
  position: number;
};
export function LeaderboardItem({
  children,
  className,
  position,
  ...rest
}: LeaderboardItemProps) {
  return (
    <li
      {...rest}
      className={cn("relative py-3 pl-14 pr-3 min-h-12", className)}
    >
      <span
        className={cn(
          "absolute top-1/2 left-3 -translate-y-1/2 leading-none h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium",
          position === 1 && "bg-yellow-400",
          position === 2 && "bg-slate-300",
          position === 3 && "bg-orange-600"
        )}
      >
        {position}
      </span>
      {children}
    </li>
  );
}

export type LeaderboardTextProps = HTMLAttributes<HTMLParagraphElement>;
export function LeaderboardText({
  children,
  className,
  ...rest
}: LeaderboardTextProps) {
  return (
    <p {...rest} className={cn("text-md font-medium", className)}>
      {children}
    </p>
  );
}

export type LeaderboardSubtextProps = HTMLAttributes<HTMLParagraphElement>;
export function LeaderboardSubtext({
  children,
  className,
  ...rest
}: LeaderboardSubtextProps) {
  return (
    <p {...rest} className={cn("text-xs", className)}>
      {children}
    </p>
  );
}

export interface LeaderboardPaginationProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  page: number;
  pageSize: number;
  total: number;
  onPageChange(page: number): void;
}
export function LeaderboardPagination({
  className,
  page,
  pageSize,
  total,
  onPageChange,
  ...rest
}: LeaderboardPaginationProps) {
  const end = Math.min(pageSize * page, total);
  const start = pageSize * (page - 1) + 1;
  const maxPage = pageSize !== 0 ? Math.ceil(total / pageSize) : total;

  const handlePreviousClick = useCallback(() => {
    if (page > 1) {
      onPageChange(page - 1);
    }
  }, [onPageChange, page]);

  const handleNextClick = useCallback(() => {
    if (page < maxPage) {
      onPageChange(page + 1);
    }
  }, [maxPage, onPageChange, page]);

  return (
    <Pagination {...rest} className={cn("p-3 select-none", className)}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            className={cn(
              page <= 1 && "pointer-events-none text-muted-foreground"
            )}
            onClick={handlePreviousClick}
          />
        </PaginationItem>

        <p className="text-xs leading-none font-medium">
          {start} - {end} of {total}
        </p>

        <PaginationItem>
          <PaginationNext
            className={cn(
              page >= maxPage && "pointer-events-none text-muted-foreground"
            )}
            onClick={handleNextClick}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
