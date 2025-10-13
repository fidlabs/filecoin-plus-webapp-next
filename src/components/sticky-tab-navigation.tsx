"use client";

import Link from "next/link";
import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type HTMLAttributes,
  type LiHTMLAttributes,
} from "react";
import { Container } from "./container";
import { cn } from "@/lib/utils";

export interface StickyTabNavigationProps
  extends HTMLAttributes<HTMLDivElement> {}

export function StickyTabNavigation({
  children,
  className,
  ...rest
}: StickyTabNavigationProps) {
  return (
    <nav
      {...rest}
      className={cn("sticky top-0 bg-header text-white z-40", className)}
    >
      <Container className="overflow-y-auto no-scrollbar">
        <ul className="flex">{children}</ul>
      </Container>
    </nav>
  );
}

export interface StickyTabNavigationItemProps
  extends LiHTMLAttributes<HTMLLIElement> {
  active?: boolean;
}

export function StickyTabNavigationItem({
  active = false,
  children,
  className,
  ...rest
}: StickyTabNavigationItemProps) {
  return (
    <li
      {...rest}
      className={cn(
        "px-6 pt-4 pb-3 border-b-2 border-b-transparent transition-colors text-sm text-center font-semibold whitespace-nowrap",
        active && "border-b-white",
        className
      )}
    >
      {children}
    </li>
  );
}

export interface IdBasedStickyTabNaviationProps
  extends Omit<StickyTabNavigationProps, "children"> {
  tabs: Record<string, ReactNode>;
}

export function IdBasedStickyTabNaviation({
  tabs,
  ...rest
}: IdBasedStickyTabNaviationProps) {
  const [activeId, setActiveId] = useState(Object.keys(tabs)[0]);

  const intersectionObserverCallback =
    useCallback<IntersectionObserverCallback>((entries) => {
      const activeEntry = entries.find((entry) => {
        return entry.isIntersecting;
      });

      if (activeEntry) {
        setActiveId(activeEntry.target.id);
      }
    }, []);

  const intersectionObserver = useMemo(() => {
    return new IntersectionObserver(intersectionObserverCallback, {
      root: null,
      rootMargin: "0px",
      threshold: 0.7,
    });
  }, [intersectionObserverCallback]);

  useEffect(() => {
    Object.keys(tabs).forEach((id) => {
      const element = document.getElementById(id);

      if (element) {
        intersectionObserver.observe(element);
      }
    });

    return () => {
      intersectionObserver.disconnect();
    };
  }, [intersectionObserver, tabs]);

  return (
    <StickyTabNavigation {...rest}>
      {Object.entries(tabs).map(([id, label]) => (
        <StickyTabNavigationItem key={id} active={id === activeId}>
          <Link href={`#${id}`}>{label}</Link>
        </StickyTabNavigationItem>
      ))}
    </StickyTabNavigation>
  );
}
