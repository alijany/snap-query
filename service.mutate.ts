import { useCallback, useMemo, useRef, useState } from "react";
import type { ZodType, ZodTypeDef } from "zod";
import { ExtractRouteParams, FetchLoadingState, FetchState, MutateOptions } from "./model";
import { replaceUrlParam } from "./utils";
import axios, { AxiosRequestConfig } from "axios";


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
  Res = unknown,
  U extends string = string,
>(
  url: U,
  {
    emitAtoms,
    reqInterceptor = (req) => req,
    defaultValidator,
    ...defaultOptions
  }: MutateOptions<Req> & { defaultValidator?: ZodType<Res, ZodTypeDef> },
) {

  type Param = ExtractRouteParams<U>;

  return function useMutate({ validator, ...mutateOptions }: { validator?: ZodType<Res, ZodTypeDef> } & AxiosRequestConfig<Req>) {
    const [state, setState] = useState<FetchState<Res>>(initialState);

    const controller = useRef(new AbortController());

    const reset = () => setState(initialState);

    const mutate = useCallback(
      async (options: { req?: AxiosRequestConfig<Req> } & (Param extends void ? { pathParams?: void } : { pathParams: Param })) => {
        setState(
          (state) =>
            ({
              ...state,
              error: null,
              isError: false,
              isLoading: true,
            }) as FetchLoadingState<Res>,
        );
        const compiledUrl = replaceUrlParam(url, options.pathParams ?? {});
        try {
          const result = await axios<Res>({
            signal: controller.current.signal,
            ...defaultOptions,
            ...mutateOptions,
            ...options.req,
            data: options.req?.data && reqInterceptor(options.req.data),
            url: compiledUrl,
          });
          const validatorResult = validator
            ? validator.parse(result.data)
            : defaultValidator
              ? defaultValidator.parse(result.data)
              : result.data;
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
        } catch (error: any) {
          console.warn(error);
          const newState = {
            error: error,
            data: null,
            fetched: false,
            isError: true,
            isSuccess: false,
            isLoading: false,
          } as const;
          setState(newState);
          return newState;
        }
      },
      [validator, mutateOptions],
    );

    return useMemo(
      () =>
        [
          { mutate, cancel: () => controller.current.abort(), reset },
          state as FetchState<Res>,
        ] as const,
      [mutate, state],
    );
  };
}