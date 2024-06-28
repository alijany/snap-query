import { createLazyHook, createMutateHook, createQueryHook } from '../../src/index'

const placeHolderUrl = 'https://jsonplaceholder.typicode.com/todos/:id'

export const [queryHook, emitQueryHook] = createQueryHook(placeHolderUrl)


export const mutateHook = createMutateHook(placeHolderUrl, {
    logLevel: 'debug'
})


export const lazyHook = createLazyHook(placeHolderUrl)