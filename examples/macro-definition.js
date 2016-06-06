var MacroPublisherDefinition = ZetaPush.definitions.MacroPublisherDefinition
function HelloMacroDefinition() {
  MacroPublisherDefinition.apply(this, arguments)
}
HelloMacroDefinition.prototype = Object.create(MacroPublisherDefinition.prototype)
HelloMacroDefinition.prototype.hello = function (value) {
  this.$publish('hello', {
    value: value
  })
}
HelloMacroDefinition.DEFAULT_DEPLOYMENT_ID = MacroPublisherDefinition.DEFAULT_DEPLOYMENT_ID

var client = new ZetaPush.WeakClient({
  sandboxId: '0gDnCfo3'
})

var service = client.createMacroPublisherSubscriber({
  definition: HelloMacroDefinition,
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

  service.publisher.hello({
    value: 'World'
  })
})

client.connect()
