# directory-api ![version](https://img.shields.io/badge/version-v2-blue.svg) [![openapi](https://img.shields.io/badge/openapi-2.0-green.svg)](./openapi.yaml) ![node](https://img.shields.io/badge/node-10.13-brightgreen.svg)

Public OSU directory API implemented with Express.

API definition is contained in the [OpenAPI specification](./openapi.yaml).

## Getting Started

### Prerequisites

1. Install Node.js from [nodejs.org](https://nodejs.org/en/).
2. Generate a self signed certificate with [OpenSSL](https://www.openssl.org/):

    ```shell
    $ openssl req -newkey rsa:2048 -new -nodes -keyout key.pem -out csr.pem
    $ openssl x509 -req -days 365 -in csr.pem -signkey key.pem -out server.crt
    ```

3. Copy [config/default-example.yaml](config/default-example.yaml) to `config/default.yaml`. Modify as necessary, being careful to avoid committing sensitive data. If you want to configure application through [custom environment variables](https://github.com/lorenwest/node-config/wiki/Environment-Variables#custom-environment-variables), copy [config/custom-environment-variables-example.yaml](config/custom-environment-variables-example.yaml) as `config/custom-environment-variables.yaml` and map the environment variable names into your configuration structure.

    **Environment variables**: Sensitive data and data that changes per environment have been moved into environment variables. Below is a list of the variables along with a definition:

    | Environment variable | Description |
    | -------------------- | ----------- |
    | `${API_HOSTNAME}` | API hostname. |
    | `${API_PORT}` | The port used by the API. |
    | `${API_ADMIN_PORT}` | The port used by the **ADMIN** endpoint. |
    | `${API_USER}` | The HTTP Basic username used to authenticate API calls. |
    | `${API_PASSWD}` | The HTTP Basic password used to authenticate API calls. |

### Installing

```shell
# Using yarn (recommended)
$ yarn

# Using npm
$ npm install
```

### Usage

Run the application:

  ```shell
  # Run linting and testing tasks before starting the app
  $ gulp run

  # Run the app without running linting and testing tasks (only for development)
  $ gulp start
  ```

## Running the tests

### Linting

Run [ESLint](https://eslint.org/) to check the code:

```shell
# Using gulp
$ gulp lint

# Using npm
$ npm run lint
```

> Note: We are following [Airbnb's style](https://github.com/airbnb/javascript) as the JavaScript style guide.

### Testing

Run unit tests:

```shell
# Using gulp
$ gulp test

# Using npm
$ npm test
```

### Type checking

This API is configured to use [Flow static type checking](https://flow.org/).

Check flow types:

```shell
# Using gulp
$ gulp typecheck

# Using npm
$ npm run typecheck
```

## Babel

This API uses [Babel](https://babeljs.io/) to transpile JavaScript code. After running, the transpiled code will be located in `dist/`. Source maps are also generated in the same directory. These contain references to the original source code for debugging purposes.

Babel allows for newer ECMAScript syntax such as `import` and `export` from ES6. It also allows [Babel plugins](https://babeljs.io/docs/en/plugins) to be used.

Compilation is done by the `babel` gulp task. This is handled automatically by other tasks but can be manually invoked:

```shell
# Using gulp
$ gulp babel

# Using npm
$ npm run babel
```

## Base project off the skeleton

### Base a new project off the skeleton

1. Clone the skeleton:

    ```shell
    $ git clone --origin skeleton git@github.com:osu-mist/express-api-skeleton.git <my-api>
    ```

2. Rename project by modifying [package.json](./package.json).

3. We use [express-openapi](https://www.npmjs.com/package/express-openapi) to generate API by inheriting openapi.yaml. Create path handlers and put them into corresponding directories. For example:

    * The path handler for `/api/v1/pets` should go to [api/v1/paths/pet.js](api/v1/paths/pet.js)
    * The path handler for `/api/v1/pets/{id}` should go to [api/v1/paths/pet/{id}.js](api/v1/paths/pet/{id}.js)

4. Copy [api/v1/serializers/pets-serializer.js](api/v1/serializers/pets-serializer.js) to `api/v1/serializers/<resources>-serializer.js` and modify as necessary:

    ```shell
    $ cp api/v1/serializers/pets-serializer.js api/v1/serializers/<resources>-serializer.js
    ```

### Incorporate updates from the skeleton
1. Fetch updates from the skeleton:

    ```shell
    $ git fetch skeleton
    ```

2. Merge the skeleton into your codebase:

    ```shell
    $ git checkout feature/CO-1234-branch
    $ git merge skeleton/master
    $ git commit -v
    ```
