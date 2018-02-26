// Create new ZetaPush Client
const client = new ZetaPush.WeakClient({
  apiUrl: 'http://hq.zpush.io:9080/zbo/pub/business',
  sandboxId: 'zetapush_v3_ghoullier'
})
const service = client.createService({
  Type: ZetaPush.services.Macro,
  listener: {
    welcome(message) {
      console.log('onWelcome', message)
    }
  }
})
client.onConnectionEstablished(() => {
  console.debug('onConnectionEstablished')
  service.call({
    name: 'welcome',
    parameters: {
      message: 'Greg'
    }
  })
})
client.connect()
