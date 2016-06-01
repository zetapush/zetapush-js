class HelloMacroDefinition extends ZetaPush.definitions.MacroPublisherDefinition {
  hello({ value }) {
    this.$publish('hello', { value })
  }
}

const client = new ZetaPush.WeakClient({
  sandboxId: 'mv-BrBKU'
})

const { publisher } = client.createMacroPublisherSubscriber({
  listener: {
    error(message) {
      console.error('macro error', message.data)
    },
    completed(message) {
      console.log('macro completed', message.data.result)
    }
  },
  definition: HelloMacroDefinition
})

client.addConnectionStatusListener({
  onConnectionEstablished() {
    console.debug('onConnectionEstablished')

    publisher.hello({
      value: 'World'
    })
  }
})

client.connect()
