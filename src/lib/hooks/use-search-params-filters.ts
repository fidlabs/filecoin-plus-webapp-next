import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

type NavigationMethod = "replace" | "push";

interface UpdateFilterOptions {
  navigationMethod?: NavigationMethod;
}

export function useSearchParamsFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = Array.from(searchParams.entries()).reduce<
    Record<string, string>
  >((result, [key, value]) => {
    return {
      ...result,
      [key]: value,
    };
  }, {});

  const navigate = useCallback(
    (params: URLSearchParams, navigationMethod: NavigationMethod) => {
      router[navigationMethod](pathname + "?" + params.toString());
    },
    [pathname, router]
  );

  const updateFilter = useCallback(
    (key: string, value: string | undefined, options?: UpdateFilterOptions) => {
      const { navigationMethod = "replace" } = options ?? {};
      const nextParams = new URLSearchParams(searchParams.toString());

      if (typeof value === "undefined") {
        nextParams.delete(key);
      } else {
        nextParams.set(key, value);
      }

      navigate(nextParams, navigationMethod);
    },
    [navigate, searchParams]
  );

  const updateFilters = useCallback(
    (
      filters: Record<string, string | undefined>,
      options?: UpdateFilterOptions
    ) => {
      const { navigationMethod = "replace" } = options ?? {};
      const nextParams = new URLSearchParams(searchParams.toString());

      Object.entries(filters).forEach(([key, value]) => {
        if (typeof value === "undefined" || value === "") {
          nextParams.delete(key);
        } else {
          nextParams.set(key, value);
        }
      });

      navigate(nextParams, navigationMethod);
    },
    [navigate, searchParams]
  );

  return {
    filters,
    updateFilter,
    updateFilters,
  };
}
