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
  },
  onConnectionClosed() {
    console.debug('onConnectionClosed')
  }
})

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
  document.querySelector('.js-Connect').addEventListener('click', () => {
    console.log('.js-Connect', 'click')
    client.connect()
  })
  document.querySelector('.js-Disconnect').addEventListener('click', () => {
    console.log('.js-Disconnect', 'click')
    client.disconnect()
  })
})
