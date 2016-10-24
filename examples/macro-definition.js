class HelloMacro extends ZetaPush.services.Macro {
  hello(value) {
    this.$publish('hello', {
      value: value
    })
  }
}
// Create new ZetaPush Client
const client = new ZetaPush.WeakClient({
  sandboxId: 'Y1k3xBDc'
})

const service = client.createService({
  Type: HelloMacro,
  listener: {
    error({ data }) {
      console.error('macro error', data)
    },
    completed({ data }) {
      console.log('macro completed', data.result)
    }
  }
})
client.onConnectionEstablished(() => {
  console.debug('onConnectionEstablished')
  service.hello({
    name: 'World'
  })
})
// Connect client to ZetaPush BaaS
client.connect()
