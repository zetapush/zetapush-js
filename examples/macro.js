// Create new ZetaPush Client
var client = new ZetaPush.WeakClient({
  sandboxId: '0gDnCfo3'
})
// Create a Macro service
var service = client.createService({
  type: ZetaPush.services.Macro,
  listener: {
    error: function (message) {
      console.error('macro error', message.data)
    },
    completed: function (message) {
      console.log('macro completed', message.data.result)
    }
  }
})
// Add connection establised listener
client.onConnectionEstablished(function () {
  console.debug('onConnectionEstablished')
})
// Add connection closed listener
client.onConnectionClosed(function () {
  console.debug('onConnectionClosed')
})
document.querySelector('.js-SayHello').addEventListener('click', function () {
  console.log('.js-SayHello', 'click')
  service.call({
    name: 'hello',
    parameters: {
      value: 'World'
    }
  })
})
document.querySelector('.js-Connect').addEventListener('click', function () {
  console.log('.js-Connect', 'click')
  // Connect client to ZetaPush BaaS
  client.connect()
})
document.querySelector('.js-Disconnect').addEventListener('click', function () {
  console.log('.js-Disconnect', 'click')
  // Disconnect client from ZetaPush BaaS
  client.disconnect()
})
