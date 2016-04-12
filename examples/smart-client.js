{
  const { SmartClient } = ZetaPush

  const BUSINESS_ID = '5mln3Zxw'
  const AUTHENTICATION_DEPLOYMENT_ID = 'VMuM'

  const client = new SmartClient({
    businessId: BUSINESS_ID,
    authenticationDeploymentId: AUTHENTICATION_DEPLOYMENT_ID
  })

  client.addConnectionStatusListener({
    onSuccessfulHandshake(authentication) {
      console.debug('onSuccessfulHandshake', authentication)
    },

    onFailedHandshake(error) {
      console.debug('onFailedHandshake', error)
    },

    onConnectionEstablished() {
      console.debug('onConnectionEstablished')
    },

    onConnectionBroken() {
      console.debug('onConnectionBroken')
    },

    onConnectionClosed() {
      console.debug('onConnectionClosed')
    }
  })

  client.connect()
}
