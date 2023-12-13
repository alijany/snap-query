# Object to FormData Converter

This is a JavaScript utility function that converts JavaScript nested objects into FormData. It's beneficial when you need to send your data to the server in `multipart/form-data` format. This utility is built with TypeScript and Lodash.

## Installation

To install this package, use the following command:

```bash
npm install nested-formdata
```

## Usage

First, import the function into your JavaScript or TypeScript file:

```ts
import { objectToFormData } from 'nested-formdata';
```

You can then use the objectToFormData function to convert an objects or array of objects to FormData:

```ts
const data = {
  name: 'John Doe',
  age: 30,
  photo: File // This can be an instance of File Or array of Files
};

const formData = objectToFormData(data);
```


You can also handle nested objects:

```ts
const data = {
  name: 'John Doe',
  age: 30,
  address: {
    city: 'New York',
    state: 'NY'
    array: [1, 2, 3],
    image: File,
  }
};

const formData = objectToFormData(data);
```

## API

`objectToFormData(obj, form, namespace)`

### Parameters

- `obj` (Object): The object to convert.
- `form` (FormData, optional): Existing FormData to use.
- `namespace` (String, optional): Namespace to prefix keys with.

### Returns

- (FormData): The resulting FormData object.

## Contributing

Pull requests are welcome. Please make sure to update tests as appropriate.

## License
This project is licensed under the MIT License.

