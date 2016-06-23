// Create new ZetaPush Client
const client = new ZetaPush.WeakClient({
  sandboxId: 'Y1k3xBDc'
})
client.onConnectionEstablished(() => {
  console.debug('onConnectionEstablished')
})
client.connect()
