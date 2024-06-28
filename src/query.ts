import axios, { AxiosError, AxiosInstance, AxiosStatic } from "axios";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ZodError, ZodType, ZodTypeDef } from "zod";
import {
  CreateQueryHookOptions,
  ExtractRouteParams,
  FetchLoadingState,
  FetchState,
  UseQueryParams,
  UseQueryReturn
} from "./model";
import { EventService } from "./service.event";
import { replaceUrlParam } from "./utils";

const initialState = {
  data: null,
  fetched: false,
  error: null,
  isLoading: false,
  isError: false,
  isSuccess: false,
} as const;

export function createQueryHook<DefReq = unknown, DefRes = unknown, U extends string = string>(
  url: U,
  {
    defaultValidator,
    logLevel = 'none',
    subscribers,
    ...defaultOptions
  }: CreateQueryHookOptions<DefReq> & {
    defaultValidator?: ZodType<DefRes, ZodTypeDef>;
    subscribers?: ((data: any) => void)[]
  } = {},
  axiosInstance: AxiosInstance | AxiosStatic = axios
) {
  const event = new EventService();

  const useQuery = <Res>(
    options: UseQueryParams<DefReq, ExtractRouteParams<U>> & {
      validator?: ZodType<Res, ZodTypeDef>;
      subscribers?: ((data: any) => void)[]
    }
  ) => {
    type ResType = Res extends object ? Res : DefRes;

    const [state, setState] = useState<FetchState<ResType>>(initialState);

    const controller = useRef(new AbortController());

    const fetch = useCallback(async () => {
      if (options.skip) {
        setState((prevState) => ({
          ...prevState,
          isLoading: false,
        }));

        return;
      }

      setState(
        (prevState) =>
        ({
          ...prevState,
          isError: false,
          error: null,
          isLoading: true,
        } as FetchLoadingState<ResType>)
      );

      controller.current = new AbortController();

      const compiledUrl = replaceUrlParam(url, options.pathParams ?? {});

      try {
        const result = await axiosInstance<ResType>({
          signal: controller.current.signal,
          ...defaultOptions,
          ...options,
          url: compiledUrl,
        });

        const validatedData = (options.validator
          ? options.validator.parse(result.data)
          : defaultValidator
            ? defaultValidator.parse(result.data)
            : result.data) as ResType;

        const neState = {
          isLoading: false,
          isError: false,
          error: null,
          data: validatedData,
          fetched: true,
          isSuccess: true,
        } as const;
        setState(neState);

        subscribers?.forEach(subscriber => subscriber(neState));
        options.subscribers?.forEach(subscriber => subscriber(neState));
      } catch (error) {
        if (logLevel === 'debug') {
          console.warn('snap-query', JSON.stringify({ error }, undefined, 2));
        }
        setState({
          ...initialState,
          error: error as AxiosError | ZodError,
          isError: true,
        });
      }
    }, [options]);

    useEffect(() => {
      fetch();
      const subscription = event.subscribe(fetch);
      return () => {
        subscription.unsubscribe();
        if (state.fetched) controller.current.abort();
      };
    }, [fetch]);

    return useMemo(
      () => ({
        ...state,
        cancel: () => controller.current.abort(),
        refresh: fetch,
      }),
      [state, fetch]
    ) as UseQueryReturn<ResType>;
  };

  return [useQuery, (data: any) => event.emit(data)] as const;
}