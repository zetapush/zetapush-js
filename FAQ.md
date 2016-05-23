# Frequently Asked Questions

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
