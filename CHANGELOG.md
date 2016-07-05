# 2.0.0-beta.20 (2016-07-05)

### Changes

* **log** Replace console.log in source code by cometd log layer
* **examples** Update examples with new **zetapush.min.js** file name

# 2.0.0-beta.19 (2016-07-04)

### Changes

* **dist** Add suffix min to build file

# 2.0.0-beta.18 (2016-06-21)

Major API modification

### BREAKING CHANGES

* **core:** Update lib/client.constructor()

**Before**

```js
// Create new ZetaPush Client
const client = new ZetaPush.Client({
  sandboxId: '<YOUR-SANDBOX-ID>',
  handshakeStrategy() {
    return ZetaPush.AuthentFactory.createWeakHandshake({
      token: null
    })
  }
})
```

**After**

```js
// Create new ZetaPush Client
const client = new ZetaPush.Client({
  sandboxId: '<YOUR-SANDBOX-ID>',
  credentials() {
    return ZetaPush.AuthentFactory.createWeakHandshake({
      token: null
    })
  }
})
```

# 2.0.0-beta.17 (2016-06-20)

Major API simplification

### BREAKING CHANGES

* **core:** Update lib/client.createService()
* **core:** Update lib/client.unsubscribe()

**Before**

```js
const service = client.createService({
  type: ZetaPush.services.Stack,
  listener: {
    list(message) {
      console.log('on list stack', message.data)
    }
  }
})
service.publisher.list({
  stack: '<STACK-ID>'
})
```

**After**

```js
const service = client.createService({
  type: ZetaPush.services.Stack,
  listener: {
    list(message) {
      console.log('on list stack', message.data)
    }
  }
})
service.list({
  stack: '<STACK-ID>'
})
```

# 2.0.0-beta.16 (2016-06-06)

Major API simplification

### BREAKING CHANGES

* **core:** Add lib/client.createService()
* **core:** Remove lib/client.createMacroPublisher()
* **core:** Remove lib/client.createServicePublisher()
* **core:** Remove lib/client.getSessionId()
* **core:** Remove lib/client.subscribe()
* **core:** Remove lib/client.createMacroPublisherSubscriber()
* **core:** Remove lib/client.createServicePublisherSubscriber()
* **core:** Remove lib/client.handshake()
* **core:** Rename lib/definitions to lib/services

**Before**

```js
var service = client.createServicePublisherSubscriber({
  definition: ZetaPush.definitions.StackPublisherDefinition,
    list: function (message) {
      console.log('on list stack', message.data)
    }
  }
})
service.publisher.list({
  stack: '<STACK-ID>'
})
```

**After**

```js
const service = client.createService({
  type: ZetaPush.services.Stack,
  listener: {
    list(message) {
      console.log('on list stack', message.data)
    }
  }
})
service.publisher.list({
  stack: '<STACK-ID>'
})
```

# 2.0.0-beta.15 (2016-06-03)

### Changes

* **misc:** Update internal default deployment id

# 2.0.0-beta.14 (2016-06-01)

### Fix

* **security:** Update forceHttps implementation

# 2.0.0-beta.13 (2016-06-01)

### Fix

* **security:** Dont override forceHttps for WeakClient

# 2.0.0-beta.12 (2016-06-01)

### Changes

* **security:** Force HTTPS when location.protocol is HTTPS

# 2.0.0-beta.11 (2016-06-01)

### Changes

* **core:**  Add shorthand methods to handle lifecycle connection events

# 2.0.0-beta.10 (2016-06-01)

### Changes

* **core:** Use default deploymentId for all services and authentication

# 2.0.0-beta.9

### Changes

* **core:** Add new API setLogLevel

### Fix

* **doc:** Update bower install path

# 2.0.0-beta.8 (2016-05-23)

### Changes

* **core:** Use subscription queue to automatically reconnect subscription

# 2.0.0-beta.7 (2016-05-23)

### Fix

* **core:** Fix connection status listener index

# 2.0.0-beta.6 (2016-05-20)

### Changes

* **core:** Rename SmartClient to WeakClient

# 2.0.0-beta.4 (2016-05-20)

### Changes

* **core:** Add new API isConnected

# 2.0.0-beta.3 (2016-05-17)

### Changes

* **macro:** Allow hardFail and debug option for macro publisher

# 2.0.0-beta.2 (2016-05-09)

### Fix

* **dependencies:** Update npm dependencies

# 2.0.0-beta.1 (2016-05-09)

### Fix

* **dependencies:** Add zetapush-cometd as a dependency

# 2.0.0-beta.0 (2016-05-09)

### Changes

* **core:** Add new API unsubscribe

# 2.0.0-alpha.6 (2016-05-02)

### Changes

* **core:** Add new VERSION parameter
* **core:** Add new API removeConnectionStatusListener

# 2.0.0-alpha.5 (2016-04-29)

### Changes

* **connection:** Add new connection lifecycle onConnectionWillClose

# 2.0.0-alpha.4 (2016-04-28)

### Fixes

* **npm:** Clean npm files

# 2.0.0-alpha.3 (2016-04-28)

### Features

* **core:** Add createMacroPublisherSubscriber() API
* **core:** Rename createServicePublisherSubscriber() API
* **examples:** Add new examples

# 2.0.0-alpha.2 (2016-04-25)

### Features

* **core:** Expose SmartClient API
* **examples:** Add new api and app examples

# 2.0.0-alpha.1 (2016-04-05)

### Features

* **core:** Complete API rewrite

### BREAKING CHANGES

* 2.x API is no longer compatible with 1.X
