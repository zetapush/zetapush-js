[![NPM version][npm-version-image]][npm-url]
[![Document][doc-version-image]][doc-url]

# ZetaPush JavaScript SDK

## Install

From bower

```console
bower install zetapush-js#2.0.0-beta.18 --save
```

```html
<script src="/bower_components/zetapush-js/dist/zetapush.js"></script>
```

From npm

```console
npm install zetapush-js@2.0.0-beta.18 --save
```

```js
import { Client } from 'zetapush-js/lib/client'
```

From CDN

```html
<script src="//cdn.rawgit.com/zetapush/zetapush-js/v2.0.0-beta.18/dist/zetapush.js"></script>
```

## Usage

```js
// Create new ZetaPush Client
var client = new ZetaPush.Client({
  sandboxId: '<YOUR-SANDBOX-ID>',
  credentials: function() {
    return ZetaPush.AuthentFactory.createWeakHandshake({
      token: null
    })
  }
})
// Create a Stack service
var service = client.createService({
  type: ZetaPush.services.Stack,
  listener: {
    list: function(message) {
      console.log('list callback', message)
    }
  }
})
// Add connection listener
client.onConnectionEstablished(function () {
  // Call service methods
  service.list({
    stack: '<YOUR-STACK-ID>'
  })
})
// Connect client to ZetaPush BaaS
client.connect()
```

[npm-version-image]: http://img.shields.io/npm/v/zetapush-js.svg?style=flat-square
[npm-url]: https://npmjs.org/package/zetapush-js

[doc-version-image]: http://zetapush.github.io/zetapush-js/badge.svg?t=0
[doc-url]: http://zetapush.github.io/zetapush-js/
