var client = new ZetaPush.WeakClient({
  sandboxId: '0gDnCfo3'
})

var service = client.createServicePublisherSubscriber({
  definition: ZetaPush.definitions.StackPublisherDefinition,
  listener: getGenericServiceListener({
    definition: ZetaPush.definitions.StackPublisherDefinition,
    handler: function (message) {
      var method = message.method
      console.debug(method, message)
      document.querySelector('form[name="' + method + '"] [name="output"]').value = JSON.stringify(message.data)
    }
  })
})

client.onSuccessfulHandshake(function (authentication) {
  console.debug('App::onSuccessfulHandshake', authentication)

  document.querySelector('i').textContent = `User Id: ${authentication.userId}`
})

client.connect()

var main = document.querySelector('main')

on(main, 'click', 'form button', function (event) {
  event.preventDefault()
  var target = event.target
  var method = target.getAttribute('method')
  var parameters = document.querySelector('form[name="' + method + '"] [name="parameters"]')
  var params = JSON.parse(parameters.value)
  service.publisher[method](params)
})
