const client = new ZetaPush.Client({
  apiUrl: 'http://vm-zbo:8080/zbo/pub/business/',
  businessId: 'JteMN0To',
  handshake: ZetaPush.AuthentFactory.createWeakHandshake({
    token: null,
    deploymentId: 'weak_main'
  })
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
