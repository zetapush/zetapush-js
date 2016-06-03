const client = new ZetaPush.Client({
  sandboxId: '0gDnCfo3',
  handshakeStrategy() {
    return ZetaPush.AuthentFactory.createWeakHandshake({
      token: null
    })
  }
})
client.onSuccessfulHandshake((authentication) => {
  console.debug('onSuccessfulHandshake', authentication)
})
client.onConnectionEstablished(() => {
  console.debug('onConnectionEstablished')
})
client.connect()
