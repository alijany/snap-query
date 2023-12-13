import { z } from "zod"
import { createQueryHook } from "./service.query"
import React, { useEffect } from "react"
import { createMutateHook } from "./service.mutate"

const url = '/test/:myPathParam'

const dto = z.object({
    name: z.string(),
})

const useQuery = createQueryHook(url, {
    // this is default validator of response body
    defaultValidator: dto,
    // this is nanostores atom to watch and trigger refetch when it changes
    watchAtoms: [],
    // you can use other axios request config options in here ...
})

export const testHook = () => {
    // create memorized param for useQuery to prevent unwanted rerender
    const params = React.useMemo(() => ({
        pathParams: {
            myPathParam: 'test'
        },
        // this options disable query hook until its become false
        skip: false,
        // you can use other axios request config options in here ...
    }), [])
    // useQuery with memorized param
    const queryResult = useQuery(params)
    // do something with query result
    useEffect(() => {
        if (queryResult.isSuccess) {
            console.log(queryResult.data.name)
        }
    }, [queryResult])
}

// USE MUTATION

const useMutate = createMutateHook(url, {
    // this is default validator of response body
    defaultValidator: dto,
    // this is nanostores atom to trigger query hook when it changes to update them
    emitAtoms: [],
    // you can use other axios request config options in here ...
})

export const testMutate = () => {
    // create memorized param for useQuery to prevent unwanted rerender
    const params = React.useMemo(() => ({
        // you can use other axios request config options in here ...
    }), [])

    // useQuery with memorized param
    const [{ cancel, mutate, reset }, queryResult] = useMutate(params)

    useEffect(() => {
        mutate({
            pathParams: {
                myPathParam: 'test'
            },
        })
    }, [])

    // do something with query result
    useEffect(() => {
        if (queryResult.isSuccess) {
            console.log(queryResult.data.name)
        }
    }, [queryResult])
}