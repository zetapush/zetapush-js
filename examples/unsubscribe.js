var client = new ZetaPush.WeakClient({
  sandboxId: '0gDnCfo3'
})
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
// Add connection listener
client.onConnectionEstablished(function () {
  console.debug('onConnectionEstablished')
})
// Connect client to ZetaPush BaaS
client.connect()
document.querySelector('.js-SayHello').addEventListener('click', function () {
  console.log('.js-SayHello', 'click')
  service.call({
    name: 'hello',
    parameters: {
      value: 'World'
    }
  })
})
document.querySelector('.js-Unsubscribe').addEventListener('click', function () {
  console.log('.js-Unsubscribe', 'click')
  client.unsubscribe(service)
})
