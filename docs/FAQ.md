# Frequently Asked Questions

## Can I use zetapush-js with TypeScript?

Yes, since 3.1.2 zetapush-js include typings definition.

## How to use [ES2015 features](https://babeljs.io/docs/learn-es2015/) (const, class, arrow functions, ...) on my project today ?

ZetaPush source code and examples are written in plain [ES2015](http://kangax.github.io/compat-table/es6/), you can use [Babel to transpile your code](https://babeljs.io/docs/learn-es2015/)

## How to subscribe and publish to a ZetaPush service ?

ZetaPush Client provide a function **createService({ type, listener })**

```js
const client = new ZetaPush.Client({ ... })
// Create a service publisher mapping Stack service
const service = client.createService({
  type: ZetaPush.services.Stack,
  listener: {
    // callback fired when a list message is fired by ZetaPush
    list(message) {
      console.log('list callback', message)
    }
  }
})
// Request a list
service.list({
  stack: '<YOUR-STACK-ID>'
})
```

## How force ZetaPush SDK to use **https** instead **http** ?

ZetaPush client allow you to declare a specific apiUrl

```js
const client = new ZetaPush.Client({
  forceHttps: true,
  sandboxId: '<YOUR-SANDBOX-ID>'
})
```

## How to use ZetaPush with my on-premise backend ?

ZetaPush client allow you to declare a specific apiUrl

```js
const client = new ZetaPush.Client({
  apiUrl: '<YOUR-ON-PREMISE-URL>',
  sandboxId: '<YOUR-SANDBOX-ID>'
})
```

## How to know my ZetaPush SDK version ?

ZetaPush SDK provide a top level constant VERSION

```js
console.log(ZetaPush.VERSION)
```

## How to change log level ?

ZetaPush Client provide a function **setLogLevel**

```js
const client = new ZetaPush.Client({
  sandboxId: '<YOUR-SANDBOX-ID>'
})
client.setLogLevel('debug')
```

## How to force long polling instead of websocket ?

ZetaPush Client provide an option to specify active transports

```js
const client = new ZetaPush.WeakClient({
  sandboxId: 'Y1k3xBDc',
  transports: [ZetaPush.TransportTypes.LONG_POLLING]
})
```

## How ZetaPush client call my service without explicit deployment id ?

ZetaPush Client provide optional deployment id, according to the following convention `${ServiceType.toLowerCase()_0}`

```js
// Create service with implicit service deployment id
const service = client.createService({
  type: ZetaPush.services.Stack,
  listener: {
    list(message) {
      console.log('on stack list', message)
    }
  }
})
service.list({
  stack: '<YOUR-STACK-ID>'
})
```

In the previous example, deployment id is `stack_0`

```js
// Create service with explicit service deployment id
const service = client.createService({
  deploymentId: 'stack_0',
  type: ZetaPush.services.Stack,
  listener: {
    list(message) {
      console.log('on stack list', message)
    }
  }
})
service.list({
  stack: '<YOUR-STACK-ID>'
})
```
