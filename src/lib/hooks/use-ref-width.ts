import { useCallback, useEffect, useRef, useState } from "react";
import { useDebounceCallback } from "usehooks-ts";

export function useRefWidth<T extends HTMLElement>() {
  const innerRef = useRef<T | null>(null);
  const [width, setWidth] = useState<number | null>(null);

  const refCallback = useCallback((ref: T | null) => {
    innerRef.current = ref;
    setWidth(ref ? ref.offsetWidth : null);
  }, []);

  const handleResize = useCallback(() => {
    if (innerRef.current) {
      setWidth(innerRef.current.offsetWidth);
    }
  }, []);

  const handleResizeDebounced = useDebounceCallback(handleResize, 50);

  useEffect(() => {
    window.addEventListener("resize", handleResizeDebounced);

    return () => {
      window.removeEventListener("resize", handleResizeDebounced);
    };
  }, [handleResizeDebounced]);

  return {
    ref: refCallback,
    width,
  };
}
