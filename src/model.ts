import type { AxiosError, AxiosRequestConfig } from 'axios';
import type { WritableAtom } from 'nanostores';
import type { ZodError } from 'zod';

export type ExtractRouteParams<T> = string extends T
  ? Record<string, string>
  : T extends `${'http' | 'https'}://${string}/${infer Rest}`
    ? ExtractRouteParams<Rest>
    : T extends `${string}/:${infer Param}/${infer Rest}`
      ? { [K in Param | keyof ExtractRouteParams<Rest>]: string | number }
      : T extends `${string}/:${infer Param}` | `${string}:${infer Param}`
        ? { [K in Param]: string | number }
        : void;

export type MutateOptions<Req> = AxiosRequestConfig<Req> & {
  emitAtoms?: WritableAtom<void>[];
  reqInterceptor?: (req: Req) => any;
};

export type CreateQueryHookOptions<Req> = AxiosRequestConfig<Req> & {
  watchAtoms?: WritableAtom<void>[];
};

export type FetchErrorState<Res> = (
  | {
      data: Res;
      fetched: true;
    }
  | {
      data: null;
      fetched: false;
    }
) & {
  error: AxiosError | ZodError;
  isLoading: false;
  isError: true;
  isSuccess: false;
};

export type FetchSuccessState<Res> = {
  data: Res;
  error: null;
  isLoading: false;
  fetched: true;
  isError: false;
  isSuccess: true;
};

export type FetchLoadingState<Res> = (
  | {
      data: Res;
      fetched: true;
      isSuccess: true;
    }
  | {
      data: null;
      fetched: false;
      isSuccess: false;
    }
) & {
  error: null;
  isLoading: true;
  isError: false;
};

export type FetchIdleState = {
  data: null;
  error: null;
  isLoading: false;
  fetched: false;
  isError: false;
  isSuccess: false;
};

export type FetchState<Res> =
  | FetchIdleState
  | FetchErrorState<Res>
  | FetchSuccessState<Res>
  | FetchLoadingState<Res>;

export type UseQueryReturn<Res> = FetchState<Res> & {
  refresh: () => Promise<void>;
};

export type UseQueryParams<Req, Param> = AxiosRequestConfig<Req> &
  (Param extends void ? { pathParams?: void } : { pathParams: Param }) & {
    skip?: boolean;
  };
