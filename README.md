[![NPM version][npm-version-image]][npm-url]
[![Document][doc-version-image]][doc-url]

# ZetaPush JavaScript SDK

## Install

From bower

```console
bower install zetapush-js#2.0.0-beta.15 --save
```

```html
<script src="/bower_components/zetapush-js/dist/zetapush.js"></script>
```

From npm

```console
npm install zetapush-js@2.0.0-beta.15 --save
```

```js
import { Client } from 'zetapush-js/lib/client'
```

From CDN

```html
<script src="//cdn.rawgit.com/zetapush/zetapush-js/v2.0.0-beta.15/dist/zetapush.js"></script>
```

## Usage

```javascript
const client = new ZetaPush.Client({
  sandboxId: '<YOUR-SANDBOX-ID>',
  handshakeStrategy() {
    return ZetaPush.AuthentFactory.createWeakHandshake({
      token: null
    })
  }
})
```

[npm-version-image]: http://img.shields.io/npm/v/zetapush-js.svg?style=flat-square
[npm-url]: https://npmjs.org/package/zetapush-js

[doc-version-image]: http://zetapush.github.io/zetapush-js/badge.svg?t=0
[doc-url]: http://zetapush.github.io/zetapush-js/
