# Nano Query

Nano Query is a minimalistic and type strict library for creating custom query and mutate hooks in React. It leverages the power of nanostores, axios, and zod to provide a simple and efficient way to manage API requests and state in your application. The package includes two main functions, createQueryHook and createMutateHook, which allow you to define and manage API queries and mutations respectively.

## Installation

You can install Nano Query via npm:

```bash
npm install nano-query
```

## Usage

### Creating a Query Hook

First, import the `createQueryHook` function from Nano Query:

```ts
import { createQueryHook } from "nano-query";
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
    // ...
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
import { createMutateHook } from "nano-query";

// Create a custom mutate hook using the createMutateHook function
const useMutate = createMutateHook(url, {
    // Default validator of the response body
    defaultValidator: dto,
    // List of nanostores atoms to trigger query hook when they change to update them
    emitAtoms: [],
    // Additional axios request config options can be provided here
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

## Contributing

Pull requests are welcome. Please make sure to update tests as appropriate.

## License
This project is licensed under the MIT License.

