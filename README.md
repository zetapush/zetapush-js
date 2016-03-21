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
  handshake: AuthentFactory.createSimpleHandshake({
    login: '<login>',
    password: '<password>',
    deploymentId: '<YOUR-DEPLOYMENT-ID>'
  })
})
```
