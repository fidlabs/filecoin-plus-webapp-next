import useSWR, {
  type SWRConfiguration,
  type SWRResponse,
  unstable_serialize,
} from "swr";
import { type ZodType } from "zod";
import { throwHTTPErrorOrSkip } from "./http-errors";
import { assertSchema } from "./utils";
import useSWRInfinite, {
  SWRInfiniteConfiguration,
  SWRInfiniteKeyLoader,
  SWRInfiniteResponse,
} from "swr/infinite";
import { useCallback } from "react";

interface PreloadConfig<TE extends boolean> {
  throwErrors?: TE;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FetcherFn<R = unknown, Args extends any[] = any[]> = (
  ...args: Args
) => Promise<R>;

type ParametrizedDataFetcher<R, P> = (parameters: P) => Promise<R>;
type NonParametrizedDataFetcher<R> = () => Promise<R>;

export type DataFetcher<R, P> =
  | ParametrizedDataFetcher<R, P>
  | NonParametrizedDataFetcher<R>;

type DataLoader<F extends FetcherFn<unknown>> = [queryKey: string, F];
type PreloadResult<R, TE extends boolean> = [
  string,
  TE extends true ? R : R | undefined,
];

type PreloadFn<F extends FetcherFn<unknown>, TE extends boolean> = (
  ...args: Parameters<F>
) => Promise<PreloadResult<ReturnType<F>, TE>>;
type FetcherFnResult<F extends FetcherFn> = Awaited<ReturnType<F>>;
type CompositeFetcherKey<F extends FetcherFn> =
  Parameters<F> extends [] ? string : [string, ...Parameters<F>];

// Default fetcher hook types
type FetcherHookConfiguration<F extends FetcherFn> = SWRConfiguration<
  FetcherFnResult<F>
>;
type FetcherHookParameters<F extends FetcherFn> = [
  ...Parameters<F>,
  config: FetcherHookConfiguration<F> | void,
];
interface CreateFetcherHookReturnType<F extends FetcherFn> {
  (...args: FetcherHookParameters<F>): SWRResponse<FetcherFnResult<F>>;
}

// Infinite fetcher hook types
interface InfiniteKeyGenerator<F extends FetcherFn> {
  (
    pageIndex: number,
    previousData: FetcherFnResult<F> | null,
    ...restArgs: Parameters<F>
  ): CompositeFetcherKey<F> | null;
}
type InfiniteFetcherHookConfiguration<F extends FetcherFn> =
  SWRInfiniteConfiguration<FetcherFnResult<F>>;
type InfiniteFetcherHookParameters<F extends FetcherFn> = [
  ...Parameters<F>,
  config: InfiniteFetcherHookConfiguration<F> | void,
];
interface CreateInfiniteFetcherHookReturnType<F extends FetcherFn> {
  (
    ...args: InfiniteFetcherHookParameters<F>
  ): SWRInfiniteResponse<FetcherFnResult<F>>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type UrlGenerator = (...args: any[]) => string;
type UrlOrUrlGenerator = string | UrlGenerator;
type UrlGeneratorParams<U extends UrlOrUrlGenerator> = U extends UrlGenerator
  ? Parameters<U>
  : [];
interface JsonFetcherOptions<U extends UrlOrUrlGenerator, R> {
  url: U;
  schema: ZodType<R, R>;
  context?: string;
}

function createCacheKey(queryKey: string, ...args: unknown[]): string {
  return args.length === 0 ? queryKey : unstable_serialize([queryKey, ...args]);
}

export function createDataLoader<F extends FetcherFn<unknown>>(
  queryKey: string,
  fetcher: F
): DataLoader<F> {
  return [queryKey, fetcher];
}

export function createPreloader<F extends FetcherFn, TE extends boolean>(
  queryKey: string,
  fetcher: F,
  config?: PreloadConfig<TE>
): PreloadFn<F, TE> {
  async function preloadInner(
    ...args: Parameters<F>
  ): Promise<PreloadResult<FetcherFnResult<F>, TE>> {
    const cacheKey = createCacheKey(queryKey, ...args);

    try {
      const result = (await fetcher(...args)) as FetcherFnResult<F>;
      return [cacheKey, result];
    } catch (error) {
      if (config?.throwErrors) {
        throw error;
      }

      return [cacheKey, undefined as FetcherFnResult<F>];
    }
  }

  return preloadInner;
}

function createResolver<F extends FetcherFn>(
  fetcher: FetcherFn
): (key: CompositeFetcherKey<F>) => Promise<FetcherFnResult<F>> {
  return function resolver(key) {
    const parameters = Array.isArray(key) ? key.slice(1) : [];
    return fetcher(...parameters) as Promise<FetcherFnResult<F>>;
  };
}

export function createFetcherHook<F extends FetcherFn>(
  fetcher: F,
  queryKey: string
): CreateFetcherHookReturnType<F> {
  return function useFetcher(...args): SWRResponse<FetcherFnResult<F>> {
    const parameters = args.slice(0, -1) as Parameters<F>;
    const config = args.at(-1) as FetcherHookConfiguration<F> | undefined;
    const cacheKey =
      parameters.length > 0 ? [queryKey, ...parameters] : queryKey;
    return useSWR(cacheKey, createResolver(fetcher), config);
  };
}

export function createInfiniteFetcherHook<F extends FetcherFn>(
  fetcher: F,
  infiniteKeyGenerator: InfiniteKeyGenerator<F>
): CreateInfiniteFetcherHookReturnType<F> {
  type KeyLoader = SWRInfiniteKeyLoader<
    FetcherFnResult<F>,
    CompositeFetcherKey<F> | null
  >;

  return function useInifiniteFetcher(...args) {
    const parameters = args.slice(0, -1) as Parameters<F>;
    const config = args.at(-1) as
      | InfiniteFetcherHookConfiguration<F>
      | undefined;

    const generateKey = useCallback<KeyLoader>(
      (pageIndex, previousData) => {
        return infiniteKeyGenerator(pageIndex, previousData, ...parameters);
      },
      [parameters]
    );

    return useSWRInfinite(generateKey, createResolver(fetcher), config);
  };
}

export function createJsonFetcher<R, U extends string | UrlGenerator>(
  options: JsonFetcherOptions<U, R>
): FetcherFn<R, UrlGeneratorParams<U>> {
  const contextPrefix = options.context ? options.context + " " : "";

  async function fetcher(...args: UrlGeneratorParams<U>): Promise<R> {
    const url =
      typeof options.url === "string" ? options.url : options.url(...args);
    const response = await fetch(url);

    throwHTTPErrorOrSkip(
      response,
      `${contextPrefix}Fetch resulted in HTTP status ${response.status}; URL: ${url}`
    );

    const json = await response.json();

    assertSchema(
      json,
      options.schema,
      `${contextPrefix}Invalid response returned; URL: ${url}`
    );

    return json as R;
  }

  return fetcher;
}
