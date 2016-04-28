{
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
      console.debug('onSuccessfulHandshake', authentication)
    },
    onConnectionEstablished() {
      console.debug('onConnectionEstablished')
    }
  })

  client.connect()
}
