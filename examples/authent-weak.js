var client = new ZetaPush.Client({
  sandboxId: '0gDnCfo3',
  handshakeStrategy: function () {
    return ZetaPush.AuthentFactory.createWeakHandshake({
      token: null
    })
  }
})
client.onSuccessfulHandshake(function (authentication) {
  console.debug('onSuccessfulHandshake', authentication)
})
client.onConnectionEstablished(function () {
  console.debug('onConnectionEstablished')
})
client.connect()
