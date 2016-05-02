class HelloMacroDefinition extends ZetaPush.definitions.AbstractPublisherDefinition {
  hello({ value }) {
    this.$publish('hello', { value })
  }
}

const client = new ZetaPush.SmartClient({
  sandboxId: '5mln3Zxw',
  authenticationDeploymentId: 'VMuM'
})

const { publisher } = client.createMacroPublisherSubscriber({
  deploymentId: 'api',
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
