import { createMutateHook, createQueryHook } from '../../dist/index';

const placeHolderUrl = 'https://jsonplaceholder.typicode.com/todos/:id';
export const queryHook = createQueryHook(placeHolderUrl);

export const mutateHook = createMutateHook(placeHolderUrl);
