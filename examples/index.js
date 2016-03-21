const client = new ZetaPush.Client({
  apiUrl: 'http://vm-zbo:8080/zbo/pub/business/',
  businessId: 'JteMN0To',
  handshake: ZetaPush.AuthentFactory.createSimpleHandshake({
    login: 'ghoullier',
    password: 'ghoullier',
    deploymentId: 'simple_user'
  })
})

client.addConnectionStatusListener({
  onSuccessfulHandshake(...params) {
    console.debug('successfulHandshake', params)
  },

  onFailedHandshake(...params) {
    console.debug('failedHandshake', params)
  },

  onConnectionEstablished(...params) {
    console.debug('connectionEstablished', params)
  },

  onConnectionBroken(...params) {
    console.debug('connectionBroken', params)
  },

  onConnectionClosed(...params) {
    console.debug('connectionClosed', params)
  }
})

client.start()

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
