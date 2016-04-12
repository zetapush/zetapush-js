{
  const { SmartClient } = ZetaPush

  const client = new SmartClient({
    apiUrl: 'http://vm-zbo:8080/zbo/pub/business/',
    businessId: 'JteMN0To',
    authenticationDeploymentId: 'weak_main'
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
