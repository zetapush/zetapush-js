[![NPM version][npm-version-image]][npm-url]
[![Document][doc-version-image]][doc-url]
[![Build Status][build-status-image]][build-status-url]

# ZetaPush JavaScript SDK

## Install

From bower

```console
bower install zetapush-js --save
```

```html
<script src="/bower_components/zetapush-js/dist/zetapush.min.js"></script>
```

From npm

```console
npm install zetapush-js --save
```

```js
import { Client, Authentication, services } from 'zetapush-js'
```

From CDN (unpkg recommended)

```html
<script src="//unpkg.com/zetapush-js/dist/zetapush.min.js"></script>
```

```js
const { Client, Authentication, services } = ZetaPush
```

## Usage

```js
// Create new ZetaPush Client
const client = new Client({
  sandboxId: '<YOUR-SANDBOX-ID>',
  authentication() {
    return Authentication.weak({
      token: null
    })
  }
})
// Create a Stack service
const service = client.createService({
  Type: services.Stack,
  listener: {
    list(message) {
      console.log('list callback', message)
    }
  }
})
// Add connection listener
client.onConnectionEstablished(() => {
  // Call service methods
  service.list({
    stack: '<YOUR-STACK-ID>'
  })
})
// Connect client to ZetaPush BaaS
client.connect()
```

## Any questions?

* :warning: ZetaPush v1.x users? Please check [Migration Guide](./docs/MIGRATION.md)
* [Frequently Asked Questions](./docs/FAQ.md)

[npm-version-image]: http://img.shields.io/npm/v/zetapush-js.svg?style=flat-square
[npm-url]: https://npmjs.org/package/zetapush-js

[doc-version-image]: http://zetapush.github.io/zetapush-js/badge.svg?t=0
[doc-url]: http://zetapush.github.io/zetapush-js/

[build-status-image]: http://img.shields.io/travis/zetapush/zetapush-js.svg?style=flat
[build-status-url]: http://travis-ci.org/zetapush/zetapush-js
