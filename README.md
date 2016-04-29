[![Document](http://zetapush.github.io/zetapush-js/badge.svg?t=0)](http://zetapush.github.io/zetapush-js/)

# ZetaPush JavaScript SDK

## Install

From bower

```console
bower install zetapush-js --save
```

```html
<script src="/bower_components/zetapush-js/dist/zetapush.js"></script>
```

From npm

```console
npm install zetapush-js --save
```

```js
import { Client } from 'zetapush-js'
```

From CDN

```html
<script src="https://static.zpush.io/js/2.0.0-alpha.5/zetapush.min.js"></script>
```

## Usage

```javascript
const client = new ZetaPush.Client({
  businessId: '<YOUR-BUSINESS-ID>',
  handshakeStrategy() {
    return ZetaPush.AuthentFactory.createWeakHandshake({
      token: null,
      deploymentId: '<YOUR-DEPLOYMENT-ID>'
    })
  }
})
```
