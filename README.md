# Snap Query

Snap Query is a minimalistic and type-safe library for creating custom query and mutation hooks in React. It leverages the power of nanostores, axios, and zod to provide a simple and efficient way to manage API requests and state in your application.

## Table of Contents

1. [Features](#features)
2. [Installation](#installation)
3. [Usage](#usage)
    - [Overview](#overview)
    - [Creating a Query Hook](#creating-a-query-hook)
    - [Using the Query Hook](#using-the-query-hook)
    - [Creating a Mutation Hook](#creating-a-mutation-hook)
    - [Using the Mutation Hook](#using-the-mutation-hook)
    - [Lazy Loading and Suspense](#lazy-loading-and-suspense)
4. [Contributing](#contributing)
5. [License](#license)

## Features

- **Atomic design**: Designed for modular and maintainable code.
- **Easy to use**: Simplifies data fetching with custom hooks.
- **Validation**: Uses Zod for response data validation.
- **Lazy loading**: Supports React Suspense for deferred loading.
- **Configurable logging**: Control logging levels for debugging.

## Installation

Install Snap Query via npm:

```bash
npm install snap-query
```

## Usage

### Overview

Snap Query provides a set of hooks for managing API requests and state in React applications. These hooks are built with type safety and simplicity in mind, ensuring that your data fetching and mutation logic is clean, maintainable, and reusable.

#### Hooks Provided:

1. **Query Hook**: Used for fetching data from an API endpoint.
2. **Mutation Hook**: Used for sending data to an API endpoint (e.g., creating or updating resources).
3. **Lazy Hook**: Used for fetching data with React Suspense, allowing for deferred loading of components.

### Creating a Query Hook

First, import the `createQueryHook` function from Snap Query:

```ts
import { createQueryHook } from "snap-query";
```

Define a URL and a DTO (Data Transfer Object) using Zod:

```ts
import { z } from "zod";

// Define the URL for the API endpoint with a parameter placeholder
const url = '/test/:myPathParam';

// Define the structure of the response data using Zod for validation
const dto = z.object({
    name: z.string(),
});
```

Create the query hook:

```ts
const [useQuery,  emitQuery] = createQueryHook(
  url,
  {
    defaultValidator: dto,   // (Optional) Validator for response data
    logLevel: 'debug',       // (Optional) default to 'none'
    // Additional axios request config options can be provided here
    // method: 'post',
    // baseURL: myBaseUrl,
  },
  axiosInstance  // (Optional) custom axios instance
);
```

### Using the Query Hook

Use the query hook in your components:

```ts
import React, { useEffect } from "react";

export const TestComponent = () => {
    const params = React.useMemo(() => ({
        pathParams: { myPathParam: 'test' },
        skip: false,
        // Additional axios request config options
        // method: 'post',
        // baseURL: myBaseUrl,
    }), []);

    const queryResult = useQuery(params);

    if (queryResult.isError) {
        return (
            <div>error</div>
        );
    }

    return (
        <div>
            {queryResult.isLoading ? 'Loading...' : queryResult.data.name}
        </div>
    );
};
```

### Creating a Mutation Hook

Import the `createMutateHook` function:

```ts
import { createMutateHook } from "snap-query";
```

Create the mutation hook:

```ts
const useMutate = createMutateHook(
  url,
  {
    defaultValidator: dto,   // (Optional) Validator for response data
    logLevel: 'debug',       // (Optional) default to 'none'
    // Additional axios request config options can be provided here
    // method: 'post',
    // baseURL: myBaseUrl,
  },
  axiosInstance  // (Optional) custom axios instance
);
```

### Using the Mutation Hook

Use the mutation hook in your components:

```ts
import React from "react";

export const TestMutate = () => {
    const [{ cancel, mutate, reset }, queryResult] = useMutate({
        // Additional axios request config options can be provided here
        // method: 'post',
        // baseURL: myBaseUrl,
    });

    const onClick = () => {
        mutate({ pathParams: { myPathParam: 'test' } });
    };

    if (queryResult.isError) {
        return (
            <div>error</div>
        );
    }

    return (
        <>
            <button onClick={onClick}>Mutate</button>
            <div>
                {queryResult.isLoading ? 'Loading...' : queryResult.data.name}
            </div>
        </>
    );
};
```

### Lazy Loading and Suspense

Snap Query supports React's Suspense for deferred loading of components.

#### Example:

Create a lazy hook:

```ts
import { createLazyHook } from "snap-query";

const useLazyUserQuery = createLazyHook(
  url,
  {
    defaultValidator: dto,   // (Optional) Validator for response data
    logLevel: 'debug',       // (Optional) default to 'none'
    // Additional axios request config options can be provided here
    // method: 'post',
    // baseURL: myBaseUrl,
  },
  axiosInstance  // (Optional) custom axios instance
);
```

Use it in your components:

```tsx
import React, { Suspense, useMemo } from "react";
import { LazyResponse } from "snap-query";

const UserDataComponent = ({ resource }: { resource: LazyResponse<ResType> }) => {
    const res = resource.read();

    if (res?.error) {
        return <div>Error</div>;
    }

    return (
        <div>
            <h1>{res?.data?.id}</h1>
            <p>{res?.data?.title}</p>
        </div>
    );
};

const App = () => {
    const [count, setCount] = React.useState(1);

    const queryParams = useMemo(() => ({
        pathParams: { id: count },
        validator: ResDto,
        // Additional axios request config options can be provided here
        // method: 'post',
        // baseURL: myBaseUrl,
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

Pull requests are welcome. Please ensure you update tests as appropriate.

## License

This project is licensed under the MIT License.