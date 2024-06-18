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
  DefReq = unknown,
  DefRes = unknown,
  U extends string = string
>(
  url: U,
  {
    watchAtoms,
    defaultValidator,
    logLevel = 'none',
    ...defaultOptions
  }: CreateQueryHookOptions<DefReq> & {
    defaultValidator?: ZodType<DefRes, ZodTypeDef>;
  } = {},
  axiosInstance: AxiosInstance | AxiosStatic = axios
) {
  return function useQuery<
    Res,
  >(
    options: UseQueryParams<DefReq, ExtractRouteParams<U>> & {
      validator?: ZodType<Res, ZodTypeDef>;
    }
  ) {
    type ResType = Res extends object ? Res : DefRes

    const [state, setState] = useState<FetchState<ResType>>(initialState);

    const controller = useRef(new AbortController());

    const fetch = useCallback(() => {
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
        } as FetchLoadingState<ResType>)
      );

      controller.current = new AbortController();

      const compiledUrl = replaceUrlParam(url, options.pathParams ?? {});
      axiosInstance<ResType>({
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
          ) as ResType;
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
          if (logLevel === 'debug')
            console.warn('snap-query', JSON.stringify({ error }, undefined, 2));
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
      fetch();
      return () => {
        if (state.fetched) controller.current.abort();
      };
    }, [fetch]);

    useEffect(() => {
      const unsubscribeCallbacks = watchAtoms?.map((refreshAtom) =>
        onSet(refreshAtom, ({ abort }) => {
          fetch();
          abort();
        })
      );
      return () => {
        unsubscribeCallbacks?.map((unsubscribe) => unsubscribe());
      };
    }, [fetch]);

    return useMemo(
      () => ({
        cancel: () => controller.current.abort(),
        refresh: fetch,
        ...state,
      }),
      [state, fetch]
    ) as UseQueryReturn<ResType>;
  };
}
