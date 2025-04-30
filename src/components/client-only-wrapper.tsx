"use client";

import { useEffect, useState, type ReactElement } from "react";

export interface ClientOnlyWrapperProps {
  children: ReactElement | null;
}

export function ClientOnlyWrapper({ children }: ClientOnlyWrapperProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return children;
}
