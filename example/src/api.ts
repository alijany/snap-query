import { createQueryHook } from '../../src/index'

const placeHolderUrl = 'https://jsonplaceholder.typicode.com/todos/:id'
export const queryHook = createQueryHook(placeHolderUrl)