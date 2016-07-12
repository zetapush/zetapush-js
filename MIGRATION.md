# Migrating from ZetaPush 1 to 2

ZetaPush 2 is a ground-up rewrite of ZetaPush. This new version of ZetaPush had three basic goals:

1. Similar API to other language implementations (Java, Swift, ...)
2. Better maintenance
3. Full CommonJS support

## Configuration

`ZetaPush 1`

```js
zp.init('<YOUR-SANDBOX-ID>')
```

`ZetaPush 2`

```js
const client = new ZetaPush.Client({
  sandboxId: '<YOUR-SANDBOX-ID>'
})
```

## Authentication

`ZetaPush 1`

```js
zp.init()
const authent= new zp.authent.Simple('<YOUR-SIMPLE-DEPLOYMENT-ID>')
zp.onHandshake((message) => {    
  console.log('ZetaPush_Hanshake_Successful', message)
})
zp.onConnected((message) => {
  if (message.successful) {
    console.log('You are connected')
  }
})
zp.connect(authent.getConnectionData('login', 'password', 'resource'))
```

`ZetaPush 2`

```js
const client = new ZetaPush.Client({
  credentials() {
    return ZetaPush.AuthentFactory.createSimpleHandshake({
      deploymentId: '<YOUR-SIMPLE-DEPLOYMENT-ID>',
      login: 'login',
      password: 'password'
    })
  }
})
zp.onSuccessfulHandshake((message) => {
  console.log('ZetaPush_Hanshake_Successful', message)
})
client.onConnectionEstablished(() => {
  console.log('You are connected')
})
client.connect()
```

## Publish/Subscribe

`ZetaPush 1`

```js
const service = new zp.service.Generic('<YOUR-STACK-DEPLOYMENT-ID>')
service.onError((message) => {
  console.error('on stack error', message)
})
service.on('list', (message) => {
  console.log('on stack list', message)
})

service.send('list', {
  stack: '<YOUR-STACK-ID>'
})
```

`ZetaPush 2`

```js
const service = client.createService({
  deploymentId: '<YOUR-STACK-DEPLOYMENT-ID>'
  type: ZetaPush.services.Stack,
  listener: {
    error(message) {
      console.error('on stack error', message)
    },
    list(message) {
      console.log('on stack list', message)
    }
  }
})
service.list({
  stack: '<YOUR-STACK-ID>'
})
```

## Optional deployment id

`ZetaPush 2` provide optional deployment id, according to the following convention `${ServiceType.toLowerCase()_0}`

```js
const service = client.createService({
  type: ZetaPush.services.Stack,
  listener: {
    error(message) {
      console.error('on stack error', message)
    },
    list(message) {
      console.log('on stack list', message)
    }
  }
})
service.list({
  stack: '<YOUR-STACK-ID>'
})
```

In the previous example, deployment id is `stack_0`
