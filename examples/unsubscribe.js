const client = new ZetaPush.SmartClient({
  sandboxId: '5mln3Zxw',
  authenticationDeploymentId: 'VMuM'
})

const { publisher, subscriptions } = client.createServicePublisherSubscriber({
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
  }
})

client.connect()

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('.js-SayHello').addEventListener('click', () => {
    console.log('.js-SayHello', 'click')
    publisher.call({
      name: 'hello',
      parameters: {
        value: 'World'
      }
    })
  })
  document.querySelector('.js-Unsubscribe').addEventListener('click', () => {
    console.log('.js-Unsubscribe', 'click')
    client.unsubscribe(subscriptions)
  })
})
