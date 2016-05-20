const client = new ZetaPush.WeakClient({
  sandboxId: '5mln3Zxw',
  authenticationDeploymentId: 'VMuM'
})

const { publisher } = client.createServicePublisherSubscriber({
  deploymentId: 'api',
  listener: {
    error(message) {
      console.error('macro error', message.data)
    },
    completed(message) {
      console.log('macro completed', message.data.result)
    }
  },
  definition: ZetaPush.definitions.MacroPublisherDefinition
})

client.addConnectionStatusListener({
  onConnectionEstablished() {
    console.debug('onConnectionEstablished')

    publisher.call({
      name: 'hello',
      parameters: {
        value: 'World'
      }
    })
  }
})

client.connect()
