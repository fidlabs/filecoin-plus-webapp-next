import { useCallback } from "react";
import useSWR, {
  type SWRConfiguration,
  type SWRResponse,
  unstable_serialize,
} from "swr";
import useSWRInfinite, {
  SWRInfiniteConfiguration,
  SWRInfiniteResponse,
} from "swr/infinite";
import { type ZodType } from "zod";
import { throwHTTPErrorOrSkip } from "./http-errors";
import { assertSchema } from "./utils";

interface PreloadConfig<TE extends boolean> {
  throwErrors?: TE;
}

type NullaryFetcherFn<R> = () => Promise<R>;
type UnaryFetcherFn<R, P> = (parameters: P) => Promise<R>;
export type FetcherFn<R, P> = NullaryFetcherFn<R> | UnaryFetcherFn<R, P>;

type PreloadResult<R, TE extends boolean> = [
  string,
  TE extends true ? R : R | undefined,
];

type NullaryFetcherPreloadFn<R, TE extends boolean> = () => Promise<
  PreloadResult<R, TE>
>;
type UnaryFetcherPreloadFn<R, P, TE extends boolean> = (
  parameters: P
) => Promise<PreloadResult<R, TE>>;
type CompositeFetcherKey<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  F extends NullaryFetcherFn<any> | UnaryFetcherFn<any, any>,
> = F extends NullaryFetcherFn<unknown> ? string : [string, Parameters<F>[0]];
type CreateNullaryFetcherHookReturnType<R> = (
  config?: SWRConfiguration<R>
) => SWRResponse<R>;
type CreateUnaryFetcherHookReturnType<R, P> = (
  parameters: P,
  config?: SWRConfiguration<R>
) => SWRResponse<R>;

// Infinite fetcher hook types
type NullaryFetcherInfiniteKeyGenerator<R> = (
  pageIndex: number,
  previousData: R | null
) => string | null;
type UnaryFetcherInfiniteKeyGenerator<R, P> = (
  pageIndex: number,
  previousData: R | null,
  parameters: P
) => [string, P] | null;
type CreateInfiniteNullaryFetcherHookReturnType<R> = (
  config?: SWRInfiniteConfiguration<R>
) => SWRInfiniteResponse<R>;
type CreateInfiniteUnaryFetcherHookReturnType<R, P> = (
  parameters: P,
  config?: SWRInfiniteConfiguration<R>
) => SWRInfiniteResponse<R>;

export type UrlGenerator<P> = (parameters: P) => string;

interface BaseJsonFetcherOptions<R> {
  schema: ZodType<R, R>;
  context?: string;
}

interface NonParametrizedJsonFetcherOptions<R>
  extends BaseJsonFetcherOptions<R> {
  url: string;
}

interface ParametrizedJsonFetcherOptions<R, P>
  extends BaseJsonFetcherOptions<R> {
  url: UrlGenerator<P>;
}

function createCacheKey(queryKey: string, ...args: unknown[]): string {
  return args.length === 0 ? queryKey : unstable_serialize([queryKey, ...args]);
}

export function createPreloader<R, TE extends boolean>(
  queryKey: string,
  fetcher: NullaryFetcherFn<R>,
  config?: PreloadConfig<TE>
): NullaryFetcherPreloadFn<R, TE>;
export function createPreloader<R, P, TE extends boolean>(
  queryKey: string,
  fetcher: UnaryFetcherFn<R, P>,
  config?: PreloadConfig<TE>
): UnaryFetcherPreloadFn<R, P, TE>;
export function createPreloader<R, P, TE extends boolean>(
  queryKey: string,
  fetcher: NullaryFetcherFn<R> | UnaryFetcherFn<R, P>,
  config?: PreloadConfig<TE>
): NullaryFetcherPreloadFn<R, TE> | UnaryFetcherPreloadFn<R, P, TE> {
  async function preloadInner(parameters?: P): Promise<PreloadResult<R, TE>> {
    const cacheKey = createCacheKey(queryKey, [parameters]);

    try {
      const result = (await fetcher(parameters as P)) as R;
      return [cacheKey, result];
    } catch (error) {
      if (config?.throwErrors) {
        throw error;
      }

      return [cacheKey, undefined as R];
    }
  }

  return preloadInner;
}

function createResolver<R, P>(
  fetcher: FetcherFn<R, P>
): (key: CompositeFetcherKey<FetcherFn<R, P>>) => Promise<R> {
  return function resolver(key) {
    const parameters = fetcher.length === 1 ? key[1] : undefined;
    return fetcher(parameters as P) as Promise<R>;
  };
}

export function createFetcherHook<R>(
  fetcher: NullaryFetcherFn<R>,
  queryKey: string
): CreateNullaryFetcherHookReturnType<R>;
export function createFetcherHook<R, P>(
  fetcher: UnaryFetcherFn<R, P>,
  queryKey: string
): CreateUnaryFetcherHookReturnType<R, P>;
export function createFetcherHook<R, P>(
  fetcher: NullaryFetcherFn<R> | UnaryFetcherFn<R, P>,
  queryKey: string
):
  | CreateNullaryFetcherHookReturnType<R>
  | CreateUnaryFetcherHookReturnType<R, P> {
  return function useFetcher(
    parametersOrConfig?: P | SWRConfiguration<R>,
    maybeConfig?: SWRConfiguration<R>
  ) {
    const parameters =
      fetcher.length === 1 ? (parametersOrConfig as P) : undefined;
    const config =
      fetcher.length === 1
        ? maybeConfig
        : (parametersOrConfig as SWRConfiguration<R>);
    const cacheKey = fetcher.length === 1 ? [queryKey, parameters] : queryKey;
    return useSWR(cacheKey, createResolver(fetcher), config);
  };
}

export function createInfiniteFetcherHook<R>(
  fetcher: NullaryFetcherFn<R>,
  infiniteKeyGenerator: NullaryFetcherInfiniteKeyGenerator<R>
): CreateInfiniteNullaryFetcherHookReturnType<R>;
export function createInfiniteFetcherHook<R, P>(
  fetcher: UnaryFetcherFn<R, P>,
  infiniteKeyGenerator: UnaryFetcherInfiniteKeyGenerator<R, P>
): CreateInfiniteUnaryFetcherHookReturnType<R, P>;
export function createInfiniteFetcherHook<R, P>(
  fetcher: NullaryFetcherFn<R> | UnaryFetcherFn<R, P>,
  infiniteKeyGenerator:
    | NullaryFetcherInfiniteKeyGenerator<R>
    | UnaryFetcherInfiniteKeyGenerator<R, P>
):
  | CreateInfiniteNullaryFetcherHookReturnType<R>
  | CreateInfiniteUnaryFetcherHookReturnType<R, P> {
  return function useInifiniteFetcher(
    parametersOrConfig?: P | SWRInfiniteConfiguration<R>,
    maybeConfig?: SWRInfiniteConfiguration<R>
  ) {
    const parameters =
      fetcher.length === 1 ? (parametersOrConfig as P) : undefined;
    const config =
      fetcher.length === 1
        ? maybeConfig
        : (parametersOrConfig as SWRInfiniteConfiguration<R>);

    const generateKey = useCallback(
      (pageIndex: number, previousData: R | null) => {
        return infiniteKeyGenerator(pageIndex, previousData, parameters as P);
      },
      [parameters]
    );

    return useSWRInfinite(generateKey, createResolver(fetcher), config);
  };
}

export function createJsonFetcher<R>(
  options: NonParametrizedJsonFetcherOptions<R>
): NullaryFetcherFn<R>;
export function createJsonFetcher<R, P>(
  options: ParametrizedJsonFetcherOptions<R, P>
): UnaryFetcherFn<R, P>;
export function createJsonFetcher<R, P>(
  options:
    | NonParametrizedJsonFetcherOptions<R>
    | ParametrizedJsonFetcherOptions<R, P>
): NullaryFetcherFn<R> | UnaryFetcherFn<R, P> {
  const contextPrefix = options.context ? options.context + " " : "";

  async function fetcher(parameters: P): Promise<R> {
    const url =
      typeof options.url === "string" ? options.url : options.url(parameters);
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
