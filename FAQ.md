# Frequently Asked Questions

## How force ZeaPush to use https instead http ?

ZetaPush client allow you to declare a specific apiUrl

```js
const client = new ZetaPush.Client({
  apiUrl: 'https://api.zpush.io/',
  businessId: '<YOUR-BUSINESS-ID>'
})
```
