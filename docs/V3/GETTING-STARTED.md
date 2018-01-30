# ZetaPush V3 Getting Started

> Install latest zetapush version

```console
yarn add zetapush-js@next zetapush-cometd
```

## Folder structure

```console
.
└──
  ├── client
  │  ├── index.html
  │  └── index.js
  └── server
    ├── api.js (api implementation)
    └── index.js (server declaration)
```

### Server Side

index.js

```javascript
const { ServerClient } = require('zetapush-js');
const NodeJSTransports = require('zetapush-cometd/lib/node/Transports');

const api = require('./api');

// Create new ZetaPush Client
const client = new ServerClient({
  apiUrl: 'http://hq.zpush.io:9080/zbo/pub/business',
  transports: NodeJSTransports,
  sandboxId: '<SANDBOX-ID>',
  login: '<LOGIN>',
  password: '<PASSWORD>',
});
client.helper.servers = Promise.resolve(['http://hq.zpush.io:9081/str']);

client
  .connect()
  .then(() => {
    console.log('[LOG] Connected');
  })
  .then(() => {
    console.log('[LOG] Register Server Task');
    client.subscribeTaskServer(api);
  })
  .catch((error) => console.error('[ERROR] ZetaPush V3 Error', error));
```

api.js

```javascript
module.exports.reduce = async (list) =>
  list.reduce((cumulator, value) => cumulator + value, 0);

module.exports.hello = async () => `Hello World from JavaScript ${Date.now()}`;
```

### Client Side

index.js

```javascript
const client = new ZetaPush.WeakClient({
  apiUrl: 'http://hq.zpush.io:9080/zbo/pub/business',
  sandboxId: '<SANDBOX-ID>',
});
client.helper.servers = Promise.resolve(['http://hq.zpush.io:9081/str']);

class Worker extends ZetaPush.services.Queue {
  get DEFAUT_DEPLOYMENT_ID() {
    return ZetaPush.services.Queue.DEFAUT_DEPLOYMENT_ID;
  }
  async hello() {
    return this.$publish('hello');
  }
  async reduce(list) {
    return this.$publish('reduce', '', list);
  }
}

const worker = client.createAsyncTaskService({
  Type: Worker,
});

client.onConnectionEstablished(async () => {
  console.debug('onConnectionEstablished');
  const message = await worker.hello();
  console.log(message);
});
client.connect();
```

index.html

```html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ZetaPush</title>
</head>

<body>
  <script src="https://unpkg.com/zetapush-js@next"></script>
  <script src="./index.js"></script>
</body>

</html>
```

### Start your server

```console
node ./server/index.js
```
