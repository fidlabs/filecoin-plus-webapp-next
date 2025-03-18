"use client";

import {
  type HTMLAttributes,
  type ReactElement,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useDebounceCallback } from "usehooks-ts";

interface Dimensions {
  width: number;
  height: number;
}

type BaseProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "ref">;
export type DimensionsBoxProps = BaseProps & {
  children(dimensions: Dimensions): ReactElement | null;
};

export function DimensionsBox({
  children: renderFn,
  ...rest
}: DimensionsBoxProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState<Dimensions>({
    width: 0,
    height: 0,
  });

  const handleRef = useCallback((containerEl: HTMLDivElement | null) => {
    if (containerEl) {
      setDimensions(getElementDimensions(containerEl));
    }

    containerRef.current = containerEl;
  }, []);

  const handleWindowResize = useCallback(() => {
    if (!containerRef.current) {
      return;
    }

    setDimensions(getElementDimensions(containerRef.current));
  }, []);
  const handleWindowResizeDebounced = useDebounceCallback(
    handleWindowResize,
    50
  );

  useEffect(() => {
    window.addEventListener("resize", handleWindowResizeDebounced);

    return () => {
      window.removeEventListener("resize", handleWindowResizeDebounced);
    };
  }, [handleWindowResizeDebounced]);

  return (
    <div {...rest} ref={handleRef}>
      {renderFn(dimensions)}
    </div>
  );
}

function getElementDimensions(element: HTMLElement): Dimensions {
  const { clientWidth: width, clientHeight: height } = element;
  return { width, height };
}
