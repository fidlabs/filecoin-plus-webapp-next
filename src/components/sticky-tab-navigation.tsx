"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  forwardRef,
  PointerEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type LegacyRef,
  type LiHTMLAttributes,
  type ReactNode,
} from "react";
import { Container } from "./container";

export interface StickyTabNavigationProps
  extends HTMLAttributes<HTMLDivElement> {
  containerRef?: LegacyRef<HTMLDivElement>;
}

interface DragScrollingState {
  elementFrom: number;
  pointerFrom: number;
}

export const StickyTabNavigation = forwardRef<
  HTMLDivElement,
  StickyTabNavigationProps
>(({ children, className, containerRef, ...rest }, ref) => {
  const [scrollingState, setScrollingState] =
    useState<DragScrollingState | null>(null);
  const [isDragScrolling, setIsDragScrolling] = useState(false);

  const handleContainerPointerDown = useCallback<
    PointerEventHandler<HTMLDivElement>
  >((event) => {
    if (event.pointerType === "mouse") {
      setScrollingState({
        elementFrom: event.currentTarget.scrollLeft,
        pointerFrom: event.clientX,
      });
    }
  }, []);

  const handleContainerPointerMove = useCallback<
    PointerEventHandler<HTMLDivElement>
  >(
    (event) => {
      if (event.pointerType === "mouse" && scrollingState !== null) {
        event.currentTarget.scrollTo({
          left:
            scrollingState.elementFrom -
            event.clientX +
            scrollingState.pointerFrom,
        });

        setIsDragScrolling(true);
      }
    },
    [scrollingState]
  );

  const handlePointerUp = useCallback((event: PointerEvent) => {
    if (event.pointerType === "mouse") {
      setScrollingState(null);
      setIsDragScrolling(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [handlePointerUp]);

  return (
    <nav
      {...rest}
      className={cn("sticky top-0 bg-header text-white z-40", className)}
      ref={ref}
    >
      <Container
        className={cn(
          "overflow-y-auto no-scrollbar cursor-grab group",
          isDragScrolling && "drag-scrolling cursor-grabbing"
        )}
        ref={containerRef}
        onPointerDown={handleContainerPointerDown}
        onPointerMove={handleContainerPointerMove}
      >
        <ul className="flex">{children}</ul>
      </Container>
    </nav>
  );
});
StickyTabNavigation.displayName = "StickyTabNavigation";

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
  const containerRef = useRef<HTMLDivElement | null>(null);

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
    if (
      typeof window === "undefined" ||
      typeof window.IntersectionObserver === "undefined"
    ) {
      return null;
    }

    return new window.IntersectionObserver(intersectionObserverCallback, {
      root: null,
      rootMargin: "0px",
      threshold: 0.7,
    });
  }, [intersectionObserverCallback]);

  useEffect(() => {
    if (intersectionObserver) {
      Object.keys(tabs).forEach((id) => {
        const element = document.getElementById(id);

        if (element) {
          intersectionObserver.observe(element);
        }
      });

      return () => {
        intersectionObserver.disconnect();
      };
    }
  }, [intersectionObserver, tabs]);

  useEffect(() => {
    const container = containerRef.current;

    if (container === null) {
      return;
    }

    const element = document.getElementById(createTabIdForId(activeId));

    if (!element) {
      return;
    }

    const scrollLeft =
      element.offsetLeft - container.offsetWidth + element.clientWidth;
    container.scrollTo({ left: Math.max(scrollLeft, 0), behavior: "smooth" });
  }, [activeId]);

  return (
    <StickyTabNavigation {...rest} containerRef={containerRef}>
      {Object.entries(tabs).map(([id, label]) => (
        <StickyTabNavigationItem
          id={createTabIdForId(id)}
          key={id}
          active={id === activeId}
          className="p-0"
        >
          <Link
            href={`#${id}`}
            className="inline-block px-6 pt-4 pb-3 group-[.drag-scrolling]:pointer-events-none"
          >
            {label}
          </Link>
        </StickyTabNavigationItem>
      ))}
    </StickyTabNavigation>
  );
}

function createTabIdForId(id: string): string {
  return `${id}_tab`;
}
