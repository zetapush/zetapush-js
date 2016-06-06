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
}),
client.onConnectionClosed(function () {
  console.debug('onConnectionClosed')
})

document.querySelector('.js-SayHello').addEventListener('click', function () {
  console.log('.js-SayHello', 'click')
  service.publisher.call({
    name: 'hello',
    parameters: {
      value: 'World'
    }
  })
})
document.querySelector('.js-Connect').addEventListener('click', function () {
  console.log('.js-Connect', 'click')
  client.connect()
})
document.querySelector('.js-Disconnect').addEventListener('click', function () {
  console.log('.js-Disconnect', 'click')
  client.disconnect()
})
