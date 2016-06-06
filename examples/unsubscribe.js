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

client.onConnectionEstablished(function () {
  console.debug('onConnectionEstablished')
})

client.connect()

document.querySelector('.js-SayHello').addEventListener('click', function () {
  console.log('.js-SayHello', 'click')
  service.publisher.call({
    name: 'hello',
    parameters: {
      value: 'World'
    }
  })
})
document.querySelector('.js-Unsubscribe').addEventListener('click', function () {
  console.log('.js-Unsubscribe', 'click')
  client.unsubscribe(service.subscriptions)
})
