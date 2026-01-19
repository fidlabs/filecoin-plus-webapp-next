import {
  type MouseEventHandler,
  type MouseEvent,
  useState,
  useEffect,
  useCallback,
} from "react";

export interface UseSingleClickHandlerParameters {
  maxIntervalMs?: number;
  onSingleClick: MouseEventHandler;
}

export type UseSingleClickHandlerReturnType = MouseEventHandler;

export function useSingleClickHandler({
  maxIntervalMs = 250,
  onSingleClick,
}: UseSingleClickHandlerParameters): UseSingleClickHandlerReturnType {
  const [pendingEvent, setPendingEvent] = useState<MouseEvent | null>(null);

  useEffect(() => {
    if (pendingEvent) {
      const timeoutId = setTimeout(() => {
        onSingleClick(pendingEvent);
        setPendingEvent(null);
      }, maxIntervalMs);

      return () => clearTimeout(timeoutId);
    }
  }, [maxIntervalMs, onSingleClick, pendingEvent]);

  const handleClick = useCallback<MouseEventHandler>((event) => {
    setPendingEvent((currentPendingEvent) => {
      return currentPendingEvent ? null : event;
    });
  }, []);

  return handleClick;
}
