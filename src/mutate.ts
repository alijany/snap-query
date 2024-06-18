import axios, { AxiosInstance, AxiosRequestConfig, AxiosStatic } from 'axios';
import { useCallback, useMemo, useRef, useState } from 'react';
import type { ZodType, ZodTypeDef } from 'zod';
import {
  ExtractRouteParams,
  FetchLoadingState,
  FetchState,
  MutateOptions,
} from './model';
import { replaceUrlParam } from './utils';

const initialState = {
  data: null,
  fetched: false,
  error: null,
  isLoading: false,
  isError: false,
  isSuccess: false,
} as const;

export function createMutateHook<
  DefReq = unknown,
  DefRes = unknown,
  U extends string = string,
>(
  url: U,
  {
    emitAtoms,
    reqInterceptor = (req) => req,
    logLevel = 'none',
    defaultValidator,
    ...defaultOptions
  }: MutateOptions<DefReq> & {
    defaultValidator?: ZodType<DefRes, ZodTypeDef>;
  } = {},
  axiosInstance: AxiosInstance | AxiosStatic = axios
) {
  type Param = ExtractRouteParams<U>;


  return function useMutate<
    ValidatedRes,
    Res = ValidatedRes extends object ? ValidatedRes : DefRes,
    T extends Param | undefined = undefined
  >(
    mutateOptions: {
      validator?: ZodType<ValidatedRes, ZodTypeDef>;
    } & AxiosRequestConfig<DefReq> & { pathParams?: T }
  ) {

    type FP = Param extends void ? { pathParams?: void } : (T extends undefined ? { pathParams: Param } : { pathParams?: Param })

    const [state, setState] = useState<FetchState<Res>>(initialState);

    const controller = useRef(new AbortController());

    const reset = () => setState(initialState);

    const mutate = useCallback(
      async (
        options: AxiosRequestConfig<DefReq> & FP
      ) => {
        setState(
          (state) =>
            ({
              ...state,
              error: null,
              isError: false,
              isLoading: true,
            }) as FetchLoadingState<Res>
        );
        const compiledUrl = replaceUrlParam(
          url,
          options.pathParams ?? mutateOptions.params ?? {}
        );

        return axiosInstance<Res>({
          signal: controller.current.signal,
          ...defaultOptions,
          ...mutateOptions,
          ...options,
          data: options?.data && reqInterceptor(options.data),
          url: compiledUrl,
        })
          .then((result) => {
            const validatorResult = (
              mutateOptions.validator
                ? mutateOptions.validator.parse(result.data)
                : defaultValidator
                  ? defaultValidator.parse(result.data)
                  : result.data
            ) as Res;
            const newState = {
              error: null,
              data: validatorResult,
              fetched: true,
              isSuccess: true,
              isLoading: false,
              isError: false,
            } as const;
            setState(newState);
            emitAtoms?.map((emitAtom) => emitAtom.set());
            return newState;
          })
          .catch((error) => {
            if (logLevel === 'debug')
              console.warn('snap-query', JSON.stringify({ error }, undefined, 2));
            const newState = {
              error: error as any,
              data: null,
              fetched: false,
              isError: true,
              isSuccess: false,
              isLoading: false,
            } as const;
            setState(newState);
            return newState;
          });
      },
      [mutateOptions]
    );

    return useMemo(
      () =>
        [
          { mutate, cancel: () => controller.current.abort(), reset },
          state as FetchState<Res>,
        ] as const,
      [mutate, state]
    );
  };
}
