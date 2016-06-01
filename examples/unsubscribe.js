const client = new ZetaPush.WeakClient({
  sandboxId: 'mv-BrBKU'
})

const { publisher, subscriptions } = client.createServicePublisherSubscriber({
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
