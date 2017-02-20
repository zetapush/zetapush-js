class WelcomeMacro extends ZetaPush.services.Macro {
  hello({ name }) {
    return this.$publish('hello', {
      name
    })
  }
}
// Create new ZetaPush Client
const client = new ZetaPush.WeakClient({
  sandboxId: 'Y1k3xBDc'
})
// Create async macro service
const service = client.createAsyncMacroService({
  Type: WelcomeMacro
})
// Handle connection established
client.onConnectionEstablished(() => {
  console.debug('onConnectionEstablished')
  service.hello({
    message: 'Test'
  }).then((result) => {
    console.log('macro hello promise', result)
  })
})
// Connect client to ZetaPush BaaS
client.connect()
