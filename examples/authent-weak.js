{
  const { AuthentFactory, Client } = ZetaPush

  const BUSINESS_ID = '5mln3Zxw'
  const AUTHENTICATION_DEPLOYMENT_ID = 'VMuM'

  const client = new Client({
    apiUrl: 'http://vm-zbo:8080/zbo/pub/business/',
    businessId: BUSINESS_ID,
    handshakeStrategy() {
      return AuthentFactory.createWeakHandshake({
        token: null,
        deploymentId: AUTHENTICATION_DEPLOYMENT_ID
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
