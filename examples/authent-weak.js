// Create new ZetaPush Client
const client = new ZetaPush.Client({
  sandboxId: 'Y1k3xBDc',
  credentials() {
    return ZetaPush.AuthentFactory.createWeakHandshake({
      token: null
    })
  }
})
// Add successful handshake listener
client.onSuccessfulHandshake((authentication) => {
  console.debug('onSuccessfulHandshake', authentication)
})
// Add connection establised listener
client.onConnectionEstablished(() => {
  console.debug('onConnectionEstablished')
})
// Connect client to ZetaPush BaaS
client.connect()
