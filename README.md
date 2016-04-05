# ZetaPush JavaScript SDK

## Install

```console
bower install zetapush-js --save
```

## Usage

```javascript
const { Client, AuthentFactory } = ZetaPush

const client = new Client({
  businessId: '<YOUR-BUSINESS-ID>',
  handshakeFactory() {
    return AuthentFactory.createWeakHandshake({
      token: null,
      deploymentId: '<YOUR-DEPLOYMENT-ID>'
    })
  }
})
```
