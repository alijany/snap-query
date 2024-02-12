import axios, { AxiosRequestConfig } from 'axios';
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
  Req = unknown,
  DefaultRes = unknown,
  U extends string = string,
>(
  url: U,
  {
    emitAtoms,
    reqInterceptor = (req) => req,
    defaultValidator,
    ...defaultOptions
  }: MutateOptions<Req> & {
    defaultValidator?: ZodType<DefaultRes, ZodTypeDef>;
  } = {}
) {
  type Param = ExtractRouteParams<U>;

  return function useMutate<
    ValidatedRes,
    Res = ValidatedRes extends void ? DefaultRes : ValidatedRes,
    T extends Param | undefined = undefined,
  >(
    mutateOptions: {
      validator?: ZodType<ValidatedRes, ZodTypeDef>;
    } & AxiosRequestConfig<Req> & {
        pathParams?: T;
      }
  ) {
    const [state, setState] = useState<FetchState<Res>>(initialState);

    const controller = useRef(new AbortController());

    const reset = () => setState(initialState);

    const mutate = useCallback(
      async (
        options: AxiosRequestConfig<Req> & (T extends Param
          ? { pathParams?: Param }
          : { pathParams: Param }
          )
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

        return axios<Res>({
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
            console.warn(error);
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
