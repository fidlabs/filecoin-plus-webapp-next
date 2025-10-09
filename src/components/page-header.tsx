import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";
import { Container } from "./container";

export interface PageHeaderProps extends HTMLAttributes<HTMLDivElement> {
  containerProps?: HTMLAttributes<HTMLDivElement>;
}

export function PageHeader({
  children,
  className,
  containerProps,
  ...rest
}: PageHeaderProps) {
  return (
    <header
      {...rest}
      className={cn("bg-header text-white pt-10 pb-9", className)}
    >
      <Container {...containerProps}>{children}</Container>
    </header>
  );
}

export function PageTitle({
  children,
  className,
  ...rest
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1
      {...rest}
      className={cn("text-3xl leading-relaxed font-semibold", className)}
    >
      {children}
    </h1>
  );
}

export function PageSubtitle({
  children,
  className,
  ...rest
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 {...rest} className={cn("text-sm leading-none", className)}>
      {children}
    </h2>
  );
}
