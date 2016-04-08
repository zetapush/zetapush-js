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
<script src="https://static.zpush.io/js/2.0.0-alpha.1/zetapush.min.js"></script>
```

## Usage

```javascript
const { Client, AuthentFactory } = ZetaPush

const client = new Client({
  businessId: '<YOUR-BUSINESS-ID>',
  handshakeStrategy() {
    return AuthentFactory.createWeakHandshake({
      token: null,
      deploymentId: '<YOUR-DEPLOYMENT-ID>'
    })
  }
})
```
