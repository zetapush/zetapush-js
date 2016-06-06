# Frequently Asked Questions

## How to call  subscribe and publish to a ZetaPush service ?

ZetaPush client allow you to declare a specific apiUrl

```js
var client = new ZetaPush.Client({ ... })
// Create a service publisher mapping Stack service
var service = client.createService({
  type: ZetaPush.services.StackService,
  listener: {
    // callback fired when a list message is fired by ZetaPush
    list: function (message) {
      console.log('cal')
    }
  }
})
// Request a list
service.publisher.list()
```

## How force ZetaPush SDK to use **https** instead **http** ?

ZetaPush client allow you to declare a specific apiUrl

```js
var client = new ZetaPush.Client({
  forceHttps: true,
  sandboxId: '<YOUR-SANDBOX-ID>'
})
```

## How to use ZetaPush with my on-premise backend ?

ZetaPush client allow you to declare a specific apiUrl

```js
var client = new ZetaPush.Client({
  apiUrl: '<YOUR-ON-PREMISE-URL>',
  sandboxId: '<YOUR-SANDBOX-ID>'
})
```

## How to know my ZetaPush SDK version ?

ZetaPush SDK provide a top level constant VERSION

```js
console.log(ZetaPush.VERSION)
```
