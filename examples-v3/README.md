# ZetaPush V3 Example

## Installation

```console
yarn install
```

## Getting started

```console
yarn start
```

## Project structure

```console
.
└──
  ├── public
  │  ├── index.html
  │  └── index.js
  ├── server
  │  └── index.js (api implementation)
  └── package.json
```

## How it works?

Server side

All methods exported in index.js file are exposed as API entry points.

Example:

```js
exports.hello = async () => `Hello World from JavaScript ${Date.now()}`;
```

This code expose an API called hello which returns a string "Hello World from JavaScript" concatened with server timestamp.

To consume an API in your front-end application you have to create a **mapped** method.

#### Define your API mapping class

```js
class Api extends ZetaPush.services.Queue {
  hello() {
    return this.$publish('hello');
  }
}
```

#### Register your API mapping class

```js
const worker = client.createAsyncTaskService({
  Type: Api,
});
```

#### Invoke your API mapping class

```js
const message = await worker.hello();
```
