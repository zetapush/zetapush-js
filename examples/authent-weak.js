const client = new ZetaPush.Client({
  sandboxId: 'mv-BrBKU',
  handshakeStrategy() {
    return ZetaPush.AuthentFactory.createWeakHandshake({
      token: null
    })
  }
})

client.addConnectionStatusListener({
  onSuccessfulHandshake(authentication) {
    console.debug('onSuccessfulHandshake', authentication)
  },
  onConnectionEstablished() {
    console.debug('onConnectionEstablished')
  }
})

client.connect()
