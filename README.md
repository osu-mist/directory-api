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
    | **${API_HOSTNAME}** | API hostname. |
    | **${API_PORT}** | The port used by the API. |
    | **${API_ADMIN_PORT}** | The port used by the **ADMIN** endpoint. |
    | **${API_USER}** | The HTTP Basic username used to authenticate API calls. |
    | **${API_PASSWD}** | The HTTP Basic password used to authenticate API calls. |

    **Options for logger configuration**:

    | Option | Description |
    | ------ | ----------- |
    | **size** | Maximum size of the file after which it will rotate. This can be a number of bytes, or units of kb, mb, and gb. If using the units, add 'k', 'm', or 'g' as the suffix. The units need to directly follow the number. |
    | **path** | The directory name to save log files to. |
    | **pattern** | A string representing the [moment.js date format](https://momentjs.com/docs/#/displaying/format/) to be used for rotating. The meta characters used in this string will dictate the frequency of the file rotation. For example, if your datePattern is simply 'HH' you will end up with 24 log files that are picked up and appended to every day. |
    | **archive** | A boolean to define whether or not to gzip archived log files. |

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

### Incorporate updates from the skeleton

1. Add the skeleton as a remote:

    ```shell
    $ git remote add skeleton git@github.com:osu-mist/express-api-skeleton.git
    ```

2. Fetch updates from the skeleton:

    ```shell
    $ git fetch skeleton
    ```

3. Merge the skeleton into your codebase:

    ```shell
    $ git checkout feature/CO-1234-branch
    $ git merge skeleton/master
    $ git commit -v
    ```
