{
  const { AuthentFactory, Client } = ZetaPush

  const client = new Client({
    apiUrl: 'http://vm-zbo:8080/zbo/pub/business/',
    businessId: 'JteMN0To',
    handshakeStrategy() {
      return AuthentFactory.createWeakHandshake({
        token: null,
        deploymentId: 'weak_main'
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

    onConnectionBroken() {
      console.debug('AuthentWeak::onConnectionBroken')
    },

    onConnectionClosed() {
      console.debug('AuthentWeak::onConnectionClosed')
    }
  })

  client.connect()
}
