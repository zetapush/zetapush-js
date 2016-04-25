const client = new ZetaPush.Client({
  businessId: '5mln3Zxw',
  handshakeStrategy() {
    return ZetaPush.AuthentFactory.createWeakHandshake({
      token: null,
      deploymentId: 'VMuM'
    })
  }
})

client.addConnectionStatusListener({
  onSuccessfulHandshake(authentication) {
    console.debug('AuthentWeak::onSuccessfulHandshake', authentication)
  },
  onFailedHandshake(error) {
    console.debug('AuthentWeak::onFailedHandshake', error)
  },
  onConnectionEstablished() {
    console.debug('AuthentWeak::onConnectionEstablished')
  },
  onConnectionClosed() {
    console.debug('AuthentWeak::onConnectionClosed')
  }
})

client.connect()
