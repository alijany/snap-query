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

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
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
      delay?: number; // Add delay option
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

      const fetchData = async () => {
        if (options.delay) {
          await delay(options.delay);
        }

        return axiosInstance<ResType>({
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
          });
      };

      return wrapPromise(fetchData()) as LazyResponse<ResType>;
    }, [options]);

    return fetchPromise;
  };
}
