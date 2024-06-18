# Snap Query

Snap Query is a minimalistic and type strict library for creating custom query and mutate hooks in React. It leverages the power of nanostores, axios, and zod to provide a simple and efficient way to manage API requests and state in your application.


## Features
 - Atomic design
 - Easy to use data fetching hooks
 - Validation support with Zod
 - Lazy loading and Suspense integration
 - Configurable logging levels

## Installation

You can install Snap Query via npm:

```bash
npm install snap-query
```

## Usage

### Creating a Query Hook

First, import the `createQueryHook` function from Snap Query:

```ts
import { createQueryHook } from "snap-query";
```

Then, define a URL and a DTO (Data Transfer Object) using zod:

```ts
import { z } from "zod"

// Define the URL for the API endpoint, with a parameter placeholder
const url = '/test/:myPathParam'

// Define the structure of the response data using zod for validation
const dto = z.object({
    name: z.string(),
})
```

Finally, create the query hook:

```ts
// Create a custom query hook using the createQueryHook function
const useQuery = createQueryHook(url, {
    // Default validator of the response body
    defaultValidator: dto,
    // List of nanostores atoms to watch and trigger refetch when they change
    watchAtoms: [],
    // Additional axios request config options can be provided here
    // axios params ...
})
```
### Using the Query Hook

Now you can use the query hook in your components:

```ts
import React, { useEffect } from "react"

// Define a test hook to use the custom query hook
export const testHook = () => {
    // Create memoized params for useQuery to avoid unnecessary rerenders
    const params = React.useMemo(() => ({
        pathParams: {
            myPathParam: 'test' // Define path parameters for the request
        },
        // This option disables the query hook until it becomes false
        skip: false,
        // Additional axios request config options can be provided here
    }), [])

    // Use the custom query hook with the memoized params
    const queryResult = useQuery(params)

    // Perform an action with the query result
    useEffect(() => {
        // If the request was successful, log the name from the response data
        if (queryResult.isSuccess) {
            console.log(queryResult.data.name)
        }
    }, [queryResult])
}
```

### Creating a Mutation Hook

Similar to the query hook, you can create a mutation hook:

```ts
import { createMutateHook } from "snap-query";

// Create a custom mutate hook using the createMutateHook function
const useMutate = createMutateHook(url, {
    // Default validator of the response body
    defaultValidator: dto,
    // List of nanostores atoms to trigger query hook when they change to update them
    emitAtoms: [],
    // Additional axios request config options can be provided here
    // axios params ...
})
```

### Using the Mutation Hook

And use it in your components:

```ts
// Define a test hook to use the custom mutate hook
export const testMutate = () => {
    // Create memoized params for useQuery to avoid unnecessary rerenders
    const params = React.useMemo(() => ({
        // Additional axios request config options can be provided here
    }), [])

    // Use the custom mutate hook with the memoized params
    const [{ cancel, mutate, reset }, queryResult] = useMutate(params)

    useEffect(() => {
        // Trigger a mutation with the specified path parameters
        mutate({
            pathParams: {
                myPathParam: 'test' // Define path parameters for the mutation
            },
        })
    }, [])

    // Perform an action with the mutation result
    useEffect(() => {
        // If the request was successful, log the name from the response data
        if (queryResult.isSuccess) {
            console.log(queryResult.data.name)
        }
    }, [queryResult])
}
```


## Lazy Loading and Suspense

The new feature allows you to use React's Suspense component with Snap Query. This helps in deferring the loading of components until they are needed and showing a fallback UI while the component is being loaded and Loading components in SSR mode.

### Example:

Here is an example of how to use the new lazy loading and Suspense feature.

Similar to the query hook, you can create a lazy hook:

```ts
import { createMutateHook } from "snap-query";

// Create a custom mutate hook using the createMutateHook function
export const useLazyUserQuery = createLazyHook(url, {
    // Default validator of the response body
    defaultValidator: dto,
    // Additional axios request config options can be provided here
    // axios params ...
})
```

And use it in your components:

```tsx
export const UserDataComponent = ({ resource }: { resource: LazyResponse<ResType> }) => {
  const res = resource.read();

  if (res?.error) {
    return <div>Error</div>
  }

  return (
    <div>
      <h1>{res?.data?.id}</h1>
      <p>{res?.data?.title}</p>
    </div>
  );
};
```

```tsx
// Define a test component to use the custom lazy hook
const App = () => {
  const [count, setCount] = React.useState(1);
  
  // Create memoized params for useQuery to avoid unnecessary rerenders
  const queryParams = useMemo(() => ({
    pathParams: {
      id: count
    },
    validator: ResDto
    // Additional axios request config options can be provided here
  }), [count]);
  
  const lazyResult = useLazyUserQuery(queryParams);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UserDataComponent resource={lazyResult} />
    </Suspense>
  );
};
```

## Contributing
Pull requests are welcome. Please make sure to update tests as appropriate.

## License
This project is licensed under the MIT License.

