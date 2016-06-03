class HelloMacroDefinition extends ZetaPush.definitions.MacroPublisherDefinition {
  hello({ value }) {
    this.$publish('hello', { value })
  }
}

const client = new ZetaPush.WeakClient({
  sandboxId: '0gDnCfo3'
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

client.onConnectionEstablished(() => {
  console.debug('onConnectionEstablished')

  publisher.hello({
    value: 'World'
  })
})

client.connect()
