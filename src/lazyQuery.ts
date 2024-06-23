import axios, { AxiosInstance, AxiosStatic } from "axios";
import { useMemo } from "react";
import type { ZodType, ZodTypeDef } from "zod";
import {
  CreateQueryHookOptions,
  ExtractRouteParams,
  UseQueryParams
} from "./model";
import { replaceUrlParam, wrapPromise } from "./utils";


export type LazyResponse<Res> = {
  read(): {
    isError: false,
    isSuccess: true,
    error: null,
    data: Res
  } | {
    isError: true,
    isSuccess: false,
    error: any,
    data: null
  } | undefined
}

export function createLazyHook<
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


    const fetchPromise = useMemo(() => {
      if (options.skip) {
        return {
          read() {
            return undefined
          },
        }
      }
      
      const compiledUrl = replaceUrlParam(url, options.pathParams ?? {});

      return wrapPromise(axiosInstance<ResType>({
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
          return {
            isError: false,
            isSuccess: true,
            error: null,
            data: validatorResult
          }
        })
        .catch((error) => {
          if (logLevel === 'debug')
            console.warn('snap-query', JSON.stringify({ error }, undefined, 2));
          return {
            isError: true,
            isSuccess: false,
            error,
            data: null
          }
        })) as (LazyResponse<ResType>);
    }, [options]);

    return fetchPromise;
  };
}
