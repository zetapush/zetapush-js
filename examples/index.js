const { AuthentFactory, Client } = ZetaPush

const client = new Client({
  apiUrl: 'http://vm-zbo:8080/zbo/pub/business/',
  businessId: 'JteMN0To',
  handshakeFactory() {
    return AuthentFactory.createSimpleHandshake({
      login: 'ghoullier',
      password: 'ghoullier',
      deploymentId: 'simple_user'
    })
  }
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

setTimeout(() => {
  const deploymentId = 'messaging_main'
  const serviceListener = {
    addMessageInConversation() {
      console.debug('addMessageInConversation', arguments)
    }
  }
  const subscripions = client.subscribeListener({ deploymentId, serviceListener })
  console.log('subscripions', subscripions)
}, 2500)
