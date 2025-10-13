import { useEffect, useState } from "react";

export function useDelayedFlag(input: boolean, delayMs: number): boolean {
  const [value, setValue] = useState(false);

  useEffect(() => {
    if (input) {
      const timeoutId = setTimeout(() => {
        setValue(true);
      }, delayMs);

      return () => {
        clearTimeout(timeoutId);
      };
    } else {
      setValue(false);
    }
  }, [delayMs, input]);

  return value;
}
