import axios, { AxiosInstance, AxiosStatic } from "axios";
import { onSet } from "nanostores";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ZodType, ZodTypeDef } from "zod";
import {
  CreateQueryHookOptions,
  ExtractRouteParams,
  FetchLoadingState,
  FetchState,
  UseQueryParams,
  UseQueryReturn,
} from "./model";
import { replaceUrlParam } from "./utils";

const initialState = {
  data: null,
  fetched: false,
  error: null,
  isLoading: false,
  isError: false,
  isSuccess: false,
} as const;

export function createQueryHook<
  Req = unknown,
  DefaultRes = unknown,
  U extends string = string
>(
  url: U,
  {
    watchAtoms,
    defaultValidator,
    ...defaultOptions
  }: CreateQueryHookOptions<Req> & {
    defaultValidator?: ZodType<DefaultRes, ZodTypeDef>;
  } = {},
  axiosInstance: AxiosInstance | AxiosStatic = axios
) {
  return function useQuery<
    ValidatedRes,
    Res = ValidatedRes extends object ? ValidatedRes : DefaultRes
  >(
    options: UseQueryParams<Req, ExtractRouteParams<U>> & {
      validator?: ZodType<ValidatedRes, ZodTypeDef>;
    }
  ) {
    const [state, setState] = useState<FetchState<Res>>(initialState);
    const controller = useRef(new AbortController());

    const refresh = useCallback(() => {
      if (options.skip) {
        setState((state) => ({
          ...state,
          isLoading: false,
          isFetching: false,
        }));
        return;
      }

      setState(
        (state) =>
          ({
            ...state,
            isError: false,
            error: null,
            isLoading: true,
          } as FetchLoadingState<Res>)
      );

      controller.current = new AbortController();

      const compiledUrl = replaceUrlParam(url, options.pathParams ?? {});
      axiosInstance<Res>({
        signal: controller.current.signal,
        ...defaultOptions,
        ...options,
        url: compiledUrl,
      })
        .then((result) => {
          const validatorResult = (
            options.validator
              ? options.validator.parse(result.data)
              : defaultValidator
              ? defaultValidator.parse(result.data)
              : result.data
          ) as Res;
          setState({
            error: null,
            data: validatorResult,
            fetched: true,
            isSuccess: true,
            isLoading: false,
            isError: false,
          });
        })
        .catch((error) => {
          console.warn({ error });
          setState(() => ({
            error: error as any,
            data: null,
            fetched: false,
            isError: true,
            isSuccess: false,
            isLoading: false,
          }));
        });
    }, [options]);

    useEffect(() => {
      refresh();
      return () => {
        if (state.fetched) controller.current.abort();
      };
    }, [refresh]);

    useEffect(() => {
      const unsubscribeCallbacks = watchAtoms?.map((refreshAtom) =>
        onSet(refreshAtom, ({ abort }) => {
          refresh();
          abort();
        })
      );
      return () => {
        unsubscribeCallbacks?.map((unsubscribe) => unsubscribe());
      };
    }, [refresh]);

    return useMemo(
      () => ({
        refresh,
        ...state,
      }),
      [state]
    ) as UseQueryReturn<Res>;
  };
}
