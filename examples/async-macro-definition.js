class WelcomeMacro extends ZetaPush.services.Macro {
  hello({ message }) {
    return this.$publish('hello', {
      message
    })
  }
  welcome({ message }) {
    return this.$publish('welcome', {
      message
    })
  }
}
// Create new ZetaPush Client
const client = new ZetaPush.WeakClient({
  sandboxId: 'Y1k3xBDc'
})

const service = client.createAsyncMacroService({
  Type: WelcomeMacro,
  listener: {
    welcome({ data }) {
      console.log('macro welcome listener', data)
    }
  }
})
client.onConnectionEstablished(() => {
  console.debug('onConnectionEstablished')
  service.welcome({
    message: 'Test'
  }).then((result) => {
    console.log('macro welcome promise', result)
  })
})
// Connect client to ZetaPush BaaS
client.connect()
