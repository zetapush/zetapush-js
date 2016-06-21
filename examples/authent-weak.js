// Create new ZetaPush Client
var client = new ZetaPush.Client({
  sandboxId: '0gDnCfo3',
  credentials: function () {
    return ZetaPush.AuthentFactory.createWeakHandshake({
      token: null
    })
  }
})
// Add successful handshake listener
client.onSuccessfulHandshake(function (authentication) {
  console.debug('onSuccessfulHandshake', authentication)
})
// Add connection establised listener
client.onConnectionEstablished(function () {
  console.debug('onConnectionEstablished')
})
// Connect client to ZetaPush BaaS
client.connect()
